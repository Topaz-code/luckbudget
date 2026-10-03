import '../user_repository.dart';

class MockUserRepository implements UserRepository {
  UserProfile _user = const UserProfile(
    id: 'usr_001',
    firstName: 'Yakubu',
    surname: 'Manage',
    email: 'yakubu.manage@example.com',
    phoneNumber: '+234 801 234 5678',
    kycTier: KycTier.tier1,
    isBiometricsEnabled: true,
    hasPinConfigured: true,
  );

  @override
  Future<UserProfile> getUserProfile() async {
    await Future.delayed(const Duration(milliseconds: 150));
    return _user;
  }

  @override
  Future<void> updateProfile({String? firstName, String? surname, String? email}) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _user = UserProfile(
      id: _user.id,
      firstName: firstName ?? _user.firstName,
      surname: surname ?? _user.surname,
      email: email ?? _user.email,
      phoneNumber: _user.phoneNumber,
      kycTier: _user.kycTier,
      isBiometricsEnabled: _user.isBiometricsEnabled,
      hasPinConfigured: _user.hasPinConfigured,
    );
  }

  @override
  Future<bool> verifyPin(String pin) async {
    await Future.delayed(const Duration(milliseconds: 200));
    // Default mock security pin is '1234'
    return pin == '1234';
  }

  @override
  Future<void> setBiometricsEnabled(bool enabled) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _user = UserProfile(
      id: _user.id,
      firstName: _user.firstName,
      surname: _user.surname,
      email: _user.email,
      phoneNumber: _user.phoneNumber,
      kycTier: _user.kycTier,
      isBiometricsEnabled: enabled,
      hasPinConfigured: _user.hasPinConfigured,
    );
  }

  @override
  Future<bool> upgradeKycTier({required String bvnOrNin}) async {
    await Future.delayed(const Duration(milliseconds: 350));
    if (bvnOrNin.length == 11) {
      _user = UserProfile(
        id: _user.id,
        firstName: _user.firstName,
        surname: _user.surname,
        email: _user.email,
        phoneNumber: _user.phoneNumber,
        kycTier: KycTier.tier2,
        isBiometricsEnabled: _user.isBiometricsEnabled,
        hasPinConfigured: _user.hasPinConfigured,
      );
      return true;
    }
    return false;
  }
}
