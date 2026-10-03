import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../state/app_state.dart';
import '../../widgets/otis_avatar.dart';

class WithdrawalFlow extends StatefulWidget {
  final AppState appState;

  const WithdrawalFlow({super.key, required this.appState});

  @override
  State<WithdrawalFlow> createState() => _WithdrawalFlowState();
}

class _WithdrawalFlowState extends State<WithdrawalFlow> {
  int _currentStep = 0; // 0: Amount, 1: Review, 2: Processing, 3: Receipt
  final TextEditingController _amountController = TextEditingController(text: '5000');

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _proceed() async {
    if (_currentStep == 0) {
      setState(() => _currentStep = 1);
    } else if (_currentStep == 1) {
      setState(() => _currentStep = 2);
      await Future.delayed(const Duration(milliseconds: 1500));
      if (!mounted) return;
      setState(() => _currentStep = 3);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(
          _currentStep == 3 ? 'Withdrawal Receipt' : 'Withdraw Funds',
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
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
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: _buildBody(),
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_currentStep == 0) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Withdraw to Bank',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 6),
          const Text(
            'Select amount to transfer to your linked personal account.',
            style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 24),
          // Destination Bank Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppTheme.accentTurquoiseLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.account_balance, color: AppTheme.primaryTeal),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Zenith Bank • Personal',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppTheme.textPrimary),
                      ),
                      Text(
                        '2104598231 • Emmanuel Yakubu',
                        style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.check_circle, color: AppTheme.accentTurquoise, size: 22),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Amount Input
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('ENTER AMOUNT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textMuted)),
                const SizedBox(height: 8),
                TextField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppTheme.primaryTeal),
                  decoration: const InputDecoration(
                    prefixText: '₦ ',
                    border: InputBorder.none,
                    isDense: true,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryTeal),
              onPressed: _proceed,
              child: const Text('Review Withdrawal', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      );
    } else if (_currentStep == 1) {
      final amt = double.tryParse(_amountController.text) ?? 5000;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Review Withdrawal', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
          const SizedBox(height: 6),
          const Text('Please verify the destination bank and fee details.', style: TextStyle(color: AppTheme.textSecondary)),
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
                _row('Destination', 'Zenith Bank (2104598231)'),
                const Divider(height: 24),
                _row('Amount', '₦${amt.toStringAsFixed(0)}', isBold: true),
                const Divider(height: 24),
                _row('Processing Fee', '₦0.00'),
                const Divider(height: 24),
                _row('Total Deducted', '₦${amt.toStringAsFixed(0)}', isBold: true),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentTurquoise),
              onPressed: _proceed,
              child: const Text('Confirm & Withdraw', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      );
    } else if (_currentStep == 2) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            CircularProgressIndicator(color: AppTheme.accentTurquoise, strokeWidth: 3.5),
            SizedBox(height: 20),
            Text('Processing transfer...', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.primaryTeal)),
            SizedBox(height: 6),
            Text('Contacting interswitch banking switch', style: TextStyle(color: AppTheme.textSecondary)),
          ],
        ),
      );
    } else {
      final amt = double.tryParse(_amountController.text) ?? 5000;
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const OtisAvatar(pose: OtisPose.confetti, height: 130),
          const SizedBox(height: 16),
          const Text('Withdrawal Sent!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.primaryTeal)),
          const SizedBox(height: 4),
          Text('₦${amt.toStringAsFixed(0)} is on its way to Zenith Bank', style: const TextStyle(color: AppTheme.textSecondary)),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryTeal),
              onPressed: () => Navigator.pop(context),
              child: const Text('Done', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      );
    }
  }

  Widget _row(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
        Text(value, style: TextStyle(fontSize: 15, fontWeight: isBold ? FontWeight.w800 : FontWeight.w600, color: isBold ? AppTheme.primaryTeal : AppTheme.textPrimary)),
      ],
    );
  }
}
