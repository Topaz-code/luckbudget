class VirtualAccountInfo {
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String provider;

  const VirtualAccountInfo({
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    this.provider = 'Monnify / Wema Bank',
  });
}

class WalletBalance {
  final double availableBalance;
  final double totalLockedSavings;
  final double dailyAllowance;
  final double todaySpent;

  const WalletBalance({
    required this.availableBalance,
    required this.totalLockedSavings,
    required this.dailyAllowance,
    required this.todaySpent,
  });

  double get netWorth => availableBalance + totalLockedSavings;
}

abstract class WalletRepository {
  Future<WalletBalance> getBalance();
  Future<VirtualAccountInfo> getVirtualAccount();
  Future<void> initiateTopUp(double amount);
  Future<bool> initiateWithdrawal({
    required double amount,
    required String destinationBank,
    required String destinationAccountNumber,
    required String pin,
  });
}
