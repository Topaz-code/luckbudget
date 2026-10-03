enum TransactionType { debit, credit, lockDeposit, lockPayout, fee }

class TransactionRecord {
  final String id;
  final String title;
  final String category;
  final double amount;
  final TransactionType type;
  final DateTime timestamp;
  final String status;
  final String? reference;

  const TransactionRecord({
    required this.id,
    required this.title,
    required this.category,
    required this.amount,
    required this.type,
    required this.timestamp,
    this.status = 'Completed',
    this.reference,
  });

  bool get isCredit => type == TransactionType.credit || type == TransactionType.lockPayout;
}

abstract class TransactionRepository {
  Future<List<TransactionRecord>> getTransactions({int limit = 20, String? category});
  Future<TransactionRecord?> getTransactionById(String id);
  Future<void> logTransaction(TransactionRecord transaction);
}
