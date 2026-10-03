import 'dart:async';
import 'package:local_auth/local_auth.dart';
import '../config/policy_config.dart';

abstract class AuthService {
  Future<bool> verifyPin(String enteredPin);
  Future<bool> changePin({required String oldPin, required String newPin});
  Future<bool> authenticateBiometrics();
  Future<bool> isBiometricsAvailable();
  int get remainingPinAttempts;
  bool get isLockedOut;
}

class MockAuthService implements AuthService {
  final LocalAuthentication _localAuth = LocalAuthentication();
  String _currentPin = '1234';
  int _failedAttempts = 0;
  DateTime? _lockoutExpiry;

  @override
  int get remainingPinAttempts => PolicyConfig.maxFailedPinAttempts - _failedAttempts;

  @override
  bool get isLockedOut {
    if (_lockoutExpiry == null) return false;
    if (DateTime.now().isAfter(_lockoutExpiry!)) {
      _lockoutExpiry = null;
      _failedAttempts = 0;
      return false;
    }
    return true;
  }

  @override
  Future<bool> verifyPin(String enteredPin) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (isLockedOut) {
      throw Exception('Security lockout in effect. Please wait 15 minutes.');
    }

    if (enteredPin == _currentPin) {
      _failedAttempts = 0;
      return true;
    } else {
      _failedAttempts++;
      if (_failedAttempts >= PolicyConfig.maxFailedPinAttempts) {
        _lockoutExpiry = DateTime.now().add(
          const Duration(minutes: PolicyConfig.pinLockoutDurationMinutes),
        );
        throw Exception('Too many failed attempts. Device locked for 15 minutes.');
      }
      return false;
    }
  }

  @override
  Future<bool> changePin({required String oldPin, required String newPin}) async {
    final verified = await verifyPin(oldPin);
    if (!verified) return false;
    _currentPin = newPin;
    return true;
  }

  @override
  Future<bool> isBiometricsAvailable() async {
    try {
      final canCheck = await _localAuth.canCheckBiometrics;
      final isSupported = await _localAuth.isDeviceSupported();
      return canCheck && isSupported;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<bool> authenticateBiometrics() async {
    try {
      final available = await isBiometricsAvailable();
      if (!available) return false;

      return await _localAuth.authenticate(
        localizedReason: 'Authorize transaction with biometrics',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );
    } catch (_) {
      return false;
    }
  }
}
