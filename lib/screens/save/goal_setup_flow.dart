import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../state/app_state.dart';
import '../../widgets/otis_avatar.dart';

class GoalSetupFlow extends StatefulWidget {
  final AppState appState;
  final String lockType; // 'year', 'goal', 'period'

  const GoalSetupFlow({
    super.key,
    required this.appState,
    required this.lockType,
  });

  @override
  State<GoalSetupFlow> createState() => _GoalSetupFlowState();
}

class _GoalSetupFlowState extends State<GoalSetupFlow> {
  int _step = 0;
  final TextEditingController _targetController = TextEditingController(text: '100000');
  final TextEditingController _titleController = TextEditingController(text: 'Emergency Fund');

  String get _title {
    if (widget.lockType == 'year') return 'Save for a Year';
    if (widget.lockType == 'period') return 'Save for a Period';
    return 'Save till Goal';
  }

  @override
  void dispose() {
    _targetController.dispose();
    _titleController.dispose();
    super.dispose();
  }

  void _proceed() async {
    if (_step == 0) {
      setState(() => _step = 1);
    } else if (_step == 1) {
      setState(() => _step = 2);
      await Future.delayed(const Duration(milliseconds: 1400));
      if (!mounted) return;
      setState(() => _step = 3);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(_step == 3 ? 'Lock Agreement' : _title,
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
        leading: _step == 3
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () {
                  if (_step > 0 && _step < 2) {
                    setState(() => _step--);
                  } else {
                    Navigator.pop(context);
                  }
                },
              ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: _buildStep(),
        ),
      ),
    );
  }

  Widget _buildStep() {
    if (_step == 0) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Setup $_title', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
          const SizedBox(height: 6),
          const Text('Lock your savings securely. Early withdrawals are restricted to protect your habits.', style: TextStyle(color: AppTheme.textSecondary)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppTheme.cardBorder)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('GOAL TITLE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textMuted)),
                TextField(
                  controller: _titleController,
                  decoration: const InputDecoration(border: InputBorder.none),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.primaryTeal),
                ),
                const Divider(height: 24),
                const Text('TARGET AMOUNT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textMuted)),
                TextField(
                  controller: _targetController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(prefixText: '₦ ', border: InputBorder.none),
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppTheme.primaryTeal),
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
              child: const Text('Review Lock Terms', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      );
    } else if (_step == 1) {
      final tgt = double.tryParse(_targetController.text) ?? 100000;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Locking Agreement', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
          const SizedBox(height: 6),
          const Text('Please review the locking conditions before locking funds.', style: TextStyle(color: AppTheme.textSecondary)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppTheme.cardBorder)),
            child: Column(
              children: [
                _row('Goal', _titleController.text),
                const Divider(height: 20),
                _row('Target', '₦${tgt.toStringAsFixed(0)}', isBold: true),
                const Divider(height: 20),
                _row('Lock Type', _title),
                const Divider(height: 20),
                _row('Interest Rate', '12% p.a.'),
                const Divider(height: 20),
                _row('Emergency Rule', 'Subject to 48hr cooldown'),
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
              child: const Text('Activate Lock Plan', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      );
    } else if (_step == 2) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            CircularProgressIndicator(color: AppTheme.accentTurquoise, strokeWidth: 3.5),
            SizedBox(height: 20),
            Text('Creating safe vault...', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.primaryTeal)),
          ],
        ),
      );
    } else {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const OtisAvatar(pose: OtisPose.money, height: 130),
          const SizedBox(height: 16),
          const Text('Lock Plan Created!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.primaryTeal)),
          const SizedBox(height: 6),
          Text('Your ${_titleController.text} is active and earning yield.', style: const TextStyle(color: AppTheme.textSecondary)),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryTeal),
              onPressed: () => Navigator.pop(context),
              child: const Text('Return to Savings', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
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
