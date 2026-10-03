class QuickSpendCategory {
  final String id;
  final String title;
  final double remainingAmount;
  final String iconCode;

  const QuickSpendCategory({
    required this.id,
    required this.title,
    required this.remainingAmount,
    required this.iconCode,
  });
}

enum TransactionType {
  income,
  expense,
  save,
}

enum TransactionStatus {
  done,
  pending,
  failed,
  syncDelayed,
}

class TransactionItem {
  final String id;
  final String title;
  final String subtitle;
  final double amount;
  final TransactionType type;
  final TransactionStatus status;
  final String timeString;
  final String dateGroup; // 'TODAY', 'YESTERDAY', etc.
  final String? category;
  final String? reference;

  const TransactionItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.type,
    required this.status,
    required this.timeString,
    required this.dateGroup,
    this.category,
    this.reference,
  });
}

class SaveGoal {
  final String id;
  final String title;
  final String subtitle;
  final double currentAmount;
  final double targetAmount;
  final String unlockDate;
  final String lockType; // 'goal', 'period', 'year'

  const SaveGoal({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.currentAmount,
    required this.targetAmount,
    required this.unlockDate,
    required this.lockType,
  });

  double get progress => (targetAmount > 0) ? (currentAmount / targetAmount).clamp(0.0, 1.0) : 0.0;
}
