import '../wallet_repository.dart';
import '../../config/policy_config.dart';

class MockWalletRepository implements WalletRepository {
  double _available = 45000.0;
  final double _locked = 1415000.0;
  final double _daily = 1000.0;
  double _spent = 0.0;

  final VirtualAccountInfo _account = const VirtualAccountInfo(
    bankName: 'Wema Bank',
    accountNumber: '0234 567 890',
    accountName: 'LockBudget / Yakubu Manage',
    provider: 'Monnify Customer Reserved Account',
  );

  @override
  Future<WalletBalance> getBalance() async {
    await Future.delayed(const Duration(milliseconds: 150));
    return WalletBalance(
      availableBalance: _available,
      totalLockedSavings: _locked,
      dailyAllowance: _daily,
      todaySpent: _spent,
    );
  }

  @override
  Future<VirtualAccountInfo> getVirtualAccount() async {
    await Future.delayed(const Duration(milliseconds: 100));
    return _account;
  }

  @override
  Future<void> initiateTopUp(double amount) async {
    await Future.delayed(const Duration(milliseconds: 200));
    // Apply CBN Tier 1 max top-up limit check
    if (amount > PolicyConfig.tier1MaxSingleTopUpNaira) {
      throw Exception('Top-up exceeds Tier 1 limit of ₦${PolicyConfig.tier1MaxSingleTopUpNaira.toStringAsFixed(0)}');
    }
    _available += amount;
  }

  @override
  Future<bool> initiateWithdrawal({
    required double amount,
    required String destinationBank,
    required String destinationAccountNumber,
    required String pin,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (amount > _available) {
      return false;
    }
    _available -= amount;
    _spent += amount;
    return true;
  }
}
