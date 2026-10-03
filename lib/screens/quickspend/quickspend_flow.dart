import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../state/app_state.dart';
import '../../widgets/otis_avatar.dart';
import '../edge_cases/failure_modal.dart';

class QuickSpendFlow extends StatefulWidget {
  final AppState appState;
  final String? initialCategoryId;

  const QuickSpendFlow({
    super.key,
    required this.appState,
    this.initialCategoryId,
  });

  @override
  State<QuickSpendFlow> createState() => _QuickSpendFlowState();
}

class _QuickSpendFlowState extends State<QuickSpendFlow> {
  int _currentStep = 0; // 0: Amount, 1: Review, 2: Processing, 3: Receipt
  late String _selectedCategoryId;
  final TextEditingController _amountController = TextEditingController(text: '2000');
  final TextEditingController _noteController = TextEditingController(text: 'Lunch & Groceries');

  @override
  void initState() {
    super.initState();
    _selectedCategoryId = widget.initialCategoryId ?? widget.appState.categories.first.id;
  }

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _proceedToReview() {
    final amt = double.tryParse(_amountController.text) ?? 0;
    if (amt <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount')),
      );
      return;
    }
    setState(() => _currentStep = 1);
  }

  void _confirmAndProcess() async {
    setState(() => _currentStep = 2);

    await Future.delayed(const Duration(milliseconds: 1400));

    final amt = double.tryParse(_amountController.text) ?? 2000;
    final success = widget.appState.executeQuickSpend(
      categoryId: _selectedCategoryId,
      amount: amt,
      note: _noteController.text,
    );

    if (!mounted) return;

    if (success) {
      setState(() => _currentStep = 3);
    } else {
      // Show Figma Failure State modal
      showDialog(
        context: context,
        builder: (context) => FailureModal(
          onRetry: () {
            Navigator.pop(context);
            _confirmAndProcess();
          },
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(
          _currentStep == 3 ? 'Receipt' : 'Quick Spend',
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: AppTheme.textPrimary,
          ),
        ),
        leading: _currentStep == 3
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () {
                  if (_currentStep > 0 && _currentStep < 2) {
                    setState(() => _currentStep--);
                  } else {
                    Navigator.pop(context);
                  }
                },
              ),
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 250),
          child: _buildCurrentStep(),
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildAmountStep();
      case 1:
        return _buildReviewStep();
      case 2:
        return _buildProcessingStep();
      case 3:
        return _buildReceiptStep();
      default:
        return const SizedBox();
    }
  }

  Widget _buildAmountStep() {
    final activeCat = widget.appState.categories.firstWhere(
      (c) => c.id == _selectedCategoryId,
      orElse: () => widget.appState.categories.first,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Select budget line',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 12),

          // Category Selector Chips
          SizedBox(
            height: 48,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: widget.appState.categories.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = widget.appState.categories[index];
                final isSelected = cat.id == _selectedCategoryId;
                return ChoiceChip(
                  label: Text('${cat.title} (₦${cat.remainingAmount.toInt()})'),
                  selected: isSelected,
                  selectedColor: AppTheme.accentTurquoiseLight,
                  backgroundColor: Colors.white,
                  side: BorderSide(
                    color: isSelected ? AppTheme.accentTurquoise : AppTheme.cardBorder,
                  ),
                  labelStyle: TextStyle(
                    color: isSelected ? AppTheme.primaryTeal : AppTheme.textSecondary,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedCategoryId = cat.id);
                    }
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 28),

          // Amount Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'AMOUNT TO RELEASE',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                    color: AppTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primaryTeal,
                  ),
                  decoration: const InputDecoration(
                    prefixText: '₦ ',
                    prefixStyle: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primaryTeal,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Flexible(
                      child: Text(
                        'Available in category:',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '₦${activeCat.remainingAmount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primaryTeal,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Note Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: TextField(
              controller: _noteController,
              decoration: const InputDecoration(
                labelText: 'Purpose / Note (Optional)',
                border: InputBorder.none,
                labelStyle: TextStyle(color: AppTheme.textSecondary),
              ),
            ),
          ),

          const SizedBox(height: 36),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryTeal,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              onPressed: _proceedToReview,
              child: const Text(
                'Review Release',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewStep() {
    final cat = widget.appState.categories.firstWhere((c) => c.id == _selectedCategoryId);
    final amt = double.tryParse(_amountController.text) ?? 2000;

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Confirm details',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Funds will be unlocked from your daily budget plan.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Column(
              children: [
                _buildReviewRow('Category', cat.title),
                const Divider(height: 24),
                _buildReviewRow('Source', "Today's Allowance"),
                const Divider(height: 24),
                _buildReviewRow('Release Amount', '₦${amt.toStringAsFixed(0)}', isBold: true),
                const Divider(height: 24),
                _buildReviewRow('Fee', '₦0.00'),
                const Divider(height: 24),
                _buildReviewRow('Note', _noteController.text.isEmpty ? 'Quick spend' : _noteController.text),
              ],
            ),
          ),

          const Spacer(),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentTurquoise,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              onPressed: _confirmAndProcess,
              child: const Text(
                'Confirm & Release',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondary,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 15,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: isBold ? AppTheme.primaryTeal : AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildProcessingStep() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          CircularProgressIndicator(
            color: AppTheme.accentTurquoise,
            strokeWidth: 3.5,
          ),
          SizedBox(height: 24),
          Text(
            'Processing release...',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppTheme.primaryTeal,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'LockBudget is updating your daily plan',
            style: TextStyle(
              fontSize: 13,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiptStep() {
    final amt = double.tryParse(_amountController.text) ?? 2000;
    final cat = widget.appState.categories.firstWhere((c) => c.id == _selectedCategoryId);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 12),
          // Otis celebrating mascot
          const OtisAvatar(
            pose: OtisPose.confetti,
            height: 140,
          ),
          const SizedBox(height: 16),
          const Text(
            'Release Successful!',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppTheme.primaryTeal,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '₦${amt.toStringAsFixed(0)} released from ${cat.title}',
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Column(
              children: [
                _buildReviewRow('Status', 'Completed', isBold: true),
                const Divider(height: 20),
                _buildReviewRow('Reference', 'TX-QS-${DateTime.now().millisecondsSinceEpoch % 10000}'),
                const Divider(height: 20),
                _buildReviewRow('Date & Time', 'Oct 2, 2026 • Just now'),
                const Divider(height: 20),
                _buildReviewRow('Category', cat.title),
              ],
            ),
          ),

          const SizedBox(height: 32),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryTeal,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Back to Home',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
