import '../transaction_repository.dart';

class MockTransactionRepository implements TransactionRepository {
  final List<TransactionRecord> _transactions = [
    TransactionRecord(
      id: 'tx_001',
      title: 'Chicken Republic',
      category: 'Food',
      amount: 4200.0,
      type: TransactionType.debit,
      timestamp: DateTime.now().subtract(const Duration(minutes: 42)),
    ),
    TransactionRecord(
      id: 'tx_002',
      title: 'MTN Data 15GB',
      category: 'Internet',
      amount: 5000.0,
      type: TransactionType.debit,
      timestamp: DateTime.now().subtract(const Duration(hours: 3)),
    ),
    TransactionRecord(
      id: 'tx_003',
      title: 'Top Up via Wema Bank',
      category: 'Wallet',
      amount: 25000.0,
      type: TransactionType.credit,
      timestamp: DateTime.now().subtract(const Duration(days: 1, hours: 2)),
    ),
    TransactionRecord(
      id: 'tx_004',
      title: 'Automated Lock Deposit',
      category: 'Savings',
      amount: 15000.0,
      type: TransactionType.lockDeposit,
      timestamp: DateTime.now().subtract(const Duration(days: 2)),
    ),
    TransactionRecord(
      id: 'tx_005',
      title: 'Bolt Ride (Lekki Phase 1)',
      category: 'Transport',
      amount: 3200.0,
      type: TransactionType.debit,
      timestamp: DateTime.now().subtract(const Duration(days: 3)),
    ),
  ];

  @override
  Future<List<TransactionRecord>> getTransactions({int limit = 20, String? category}) async {
    await Future.delayed(const Duration(milliseconds: 150));
    var list = _transactions;
    if (category != null && category.isNotEmpty && category.toLowerCase() != 'all') {
      list = list.where((t) => t.category.toLowerCase() == category.toLowerCase()).toList();
    }
    return list.take(limit).toList();
  }

  @override
  Future<TransactionRecord?> getTransactionById(String id) async {
    await Future.delayed(const Duration(milliseconds: 100));
    try {
      return _transactions.firstWhere((t) => t.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> logTransaction(TransactionRecord transaction) async {
    await Future.delayed(const Duration(milliseconds: 100));
    _transactions.insert(0, transaction);
  }
}
