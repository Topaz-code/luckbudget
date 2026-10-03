import 'dart:async';
import '../../models/budget_models.dart';
import '../config/policy_config.dart';

class TransactionReceipt {
  final String transactionId;
  final double amount;
  final String categoryTitle;
  final DateTime timestamp;
  final String reference;
  final TransactionStatus status;

  const TransactionReceipt({
    required this.transactionId,
    required this.amount,
    required this.categoryTitle,
    required this.timestamp,
    required this.reference,
    required this.status,
  });
}

abstract class WalletService {
  Future<double> getDailyAllowance();
  Future<double> getTotalBalance();
  Future<TransactionReceipt> executeQuickSpend({
    required String categoryId,
    required double amount,
    String? note,
  });
  Future<TransactionReceipt> executeWithdrawal({
    required String bankName,
    required String accountNumber,
    required double amount,
  });
}

class MockWalletService implements WalletService {
  double _allowance = 7500.0;
  double _balance = 184250.0;

  @override
  Future<double> getDailyAllowance() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _allowance;
  }

  @override
  Future<double> getTotalBalance() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _balance;
  }

  @override
  Future<TransactionReceipt> executeQuickSpend({
    required String categoryId,
    required double amount,
    String? note,
  }) async {
    await Future.delayed(const Duration(milliseconds: 800));

    if (amount > _allowance) {
      throw Exception('Exceeds daily allowance of ₦$_allowance');
    }

    if (PolicyConfig.quickSpendInstantInternalDebit) {
      _allowance -= amount;
      _balance -= amount;
    }

    final id = 'TX-QS-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    return TransactionReceipt(
      transactionId: id,
      amount: amount,
      categoryTitle: categoryId.toUpperCase(),
      timestamp: DateTime.now(),
      reference: 'REF-$id',
      status: TransactionStatus.done,
    );
  }

  @override
  Future<TransactionReceipt> executeWithdrawal({
    required String bankName,
    required String accountNumber,
    required double amount,
  }) async {
    await Future.delayed(const Duration(milliseconds: 1200));

    if (amount > _allowance) {
      throw Exception('Withdrawal exceeds current available allowance');
    }

    _allowance -= amount;
    _balance -= amount;

    final id = 'TX-WTH-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    return TransactionReceipt(
      transactionId: id,
      amount: amount,
      categoryTitle: 'Bank Payout ($bankName)',
      timestamp: DateTime.now(),
      reference: 'NIP-$id',
      status: TransactionStatus.done,
    );
  }
}
