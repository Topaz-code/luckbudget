import 'dart:async';

class VirtualAccountDetails {
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String provider;

  const VirtualAccountDetails({
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    required this.provider,
  });
}

class LinkedBankAccount {
  final String id;
  final String bankName;
  final String accountNumber;
  final String accountName;
  final bool isDefault;

  const LinkedBankAccount({
    required this.id,
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    this.isDefault = false,
  });
}

abstract class BankService {
  Future<VirtualAccountDetails> getVirtualReservedAccount();
  Future<List<LinkedBankAccount>> getLinkedAccounts();
  Future<LinkedBankAccount> linkBankAccount({
    required String bankName,
    required String accountNumber,
    required String accountName,
  });
}

class MockBankService implements BankService {
  final VirtualAccountDetails _virtualAccount = const VirtualAccountDetails(
    bankName: 'Wema Bank',
    accountNumber: '8123456789',
    accountName: 'Yakubu Otis / LockBudget',
    provider: 'Monnify Reserved',
  );

  final List<LinkedBankAccount> _linkedBanks = [
    const LinkedBankAccount(
      id: 'bnk_1',
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0123456789',
      accountName: 'Yakubu Otis',
      isDefault: true,
    ),
    const LinkedBankAccount(
      id: 'bnk_2',
      bankName: 'Kuda Microfinance Bank',
      accountNumber: '2019283746',
      accountName: 'Yakubu Otis',
      isDefault: false,
    ),
  ];

  @override
  Future<VirtualAccountDetails> getVirtualReservedAccount() async {
    await Future.delayed(const Duration(milliseconds: 350));
    return _virtualAccount;
  }

  @override
  Future<List<LinkedBankAccount>> getLinkedAccounts() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return List.unmodifiable(_linkedBanks);
  }

  @override
  Future<LinkedBankAccount> linkBankAccount({
    required String bankName,
    required String accountNumber,
    required String accountName,
  }) async {
    await Future.delayed(const Duration(milliseconds: 900));
    final newBank = LinkedBankAccount(
      id: 'bnk_${DateTime.now().millisecondsSinceEpoch}',
      bankName: bankName,
      accountNumber: accountNumber,
      accountName: accountName,
      isDefault: false,
    );
    _linkedBanks.add(newBank);
    return newBank;
  }
}
