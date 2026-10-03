import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../state/app_state.dart';
import '../../widgets/otis_avatar.dart';
import 'goal_setup_flow.dart';

class SaveScreen extends StatelessWidget {
  final AppState appState;

  const SaveScreen({super.key, required this.appState});

  @override
  Widget build(BuildContext context) {
    final goal = appState.activeGoal;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 20, right: 20, top: 12, bottom: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Save',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
              ),
            ),
            const Text(
              'Build what you are protecting',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 16),

            // Hero Card: Otis with Safe
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'You are building room for later',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryTeal,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          '₦ ${appState.totalSavedMonth.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryTeal,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'saved this month',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Otis with Safe Mascot
                  const OtisAvatar(
                    pose: OtisPose.safe,
                    height: 95,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Start a Save Section
            const Text(
              'Start a save',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 12),

            _buildSaveTypeCard(
              context,
              title: 'Save for a year',
              subtitle: 'Lock money for a full year.',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GoalSetupFlow(appState: appState, lockType: 'year'),
                  ),
                );
              },
            ),
            const SizedBox(height: 10),

            _buildSaveTypeCard(
              context,
              title: 'Save till goal',
              subtitle: 'Top up until you reach a target.',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GoalSetupFlow(appState: appState, lockType: 'goal'),
                  ),
                );
              },
            ),
            const SizedBox(height: 10),

            _buildSaveTypeCard(
              context,
              title: 'Save for a period',
              subtitle: 'Choose when the money unlocks.',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GoalSetupFlow(appState: appState, lockType: 'period'),
                  ),
                );
              },
            ),

            const SizedBox(height: 28),

            // Active Save Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Active save',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('View'),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Active Goal Card
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              goal.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              goal.subtitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '₦ ${goal.currentAmount.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryTeal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: goal.progress,
                      minHeight: 8,
                      backgroundColor: AppTheme.background,
                      color: AppTheme.accentTurquoise,
                    ),
                  ),

                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Text(
                          'Target: ₦${goal.targetAmount.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 12.5, color: AppTheme.textMuted),
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accentTurquoiseLight,
                          foregroundColor: AppTheme.primaryTeal,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          appState.topUpSaveGoal(5000);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Added ₦5,000 to Active Save Goal!')),
                          );
                        },
                        child: const Text('Top up +₦5k', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSaveTypeCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppTheme.cardBorder),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
        title: Text(
          title,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
        ),
        trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted),
        onTap: onTap,
      ),
    );
  }
}
