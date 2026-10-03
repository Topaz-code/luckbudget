import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../state/app_state.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/custom_nav_bar.dart';
import 'home/home_screen.dart';
import 'save/save_screen.dart';
import 'budget/budget_screen.dart';
import 'activity/activity_screen.dart';
import 'onboarding/onboarding_intro_screen.dart';


class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  final AppState _appState = AppState();

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _appState,
      builder: (context, _) {
        return Scaffold(
          backgroundColor: AppTheme.background,
          appBar: _currentIndex == 0 ? const CustomAppBar() : null,
          endDrawer: _buildSimulationDrawer(),
          body: SafeArea(
            top: _currentIndex != 0,
            bottom: false,
            child: IndexedStack(
              index: _currentIndex,
              children: [
                HomeScreen(
                  appState: _appState,
                  onViewAllActivity: () => setState(() => _currentIndex = 3),
                ),
                SaveScreen(appState: _appState),
                BudgetScreen(appState: _appState),
                ActivityScreen(appState: _appState),
              ],
            ),
          ),
          bottomNavigationBar: CustomNavBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
          ),
          floatingActionButton: FloatingActionButton.small(
            backgroundColor: AppTheme.primaryTeal,
            foregroundColor: Colors.white,
            tooltip: 'Figma Edge Case Simulator',
            child: const Icon(Icons.developer_mode, size: 20),
            onPressed: () {
              Scaffold.of(context).openEndDrawer();
            },
          ),
        );
      },
    );
  }

  Widget _buildSimulationDrawer() {
    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Figma Flow Simulator',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.primaryTeal),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'Test the different journey boards from the 113 Figma screens.',
                style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 24),

              // Offline Toggle
              SwitchListTile(
                title: const Text('Simulate Offline Mode (offline_all)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                subtitle: const Text('Queues releases with sync-delayed badge', style: TextStyle(fontSize: 12)),
                value: _appState.isOffline,
                activeThumbColor: AppTheme.accentTurquoise,
                onChanged: (_) {
                  _appState.toggleOfflineSimulation();
                  Navigator.pop(context);
                },
              ),

              const Divider(),

              // Failure State Toggle
              SwitchListTile(
                title: const Text('Simulate Network Error (failure_states_all)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                subtitle: const Text('Triggers Figma failure modal with sad Otis', style: TextStyle(fontSize: 12)),
                value: _appState.simulateNetworkError,
                activeThumbColor: AppTheme.dangerRed,
                onChanged: (_) {
                  _appState.toggleFailureSimulation();
                  Navigator.pop(context);
                },
              ),

              const Divider(),

              const SizedBox(height: 16),
              const Text(
                'Quick Route Jumper',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _routeChip('Home', 0),
                  _routeChip('Save', 1),
                  _routeChip('Budget', 2),
                  _routeChip('Activity', 3),
                ],
              ),
              const SizedBox(height: 20),
              OutlinedButton.icon(
                icon: const Icon(Icons.restart_alt, color: AppTheme.primaryTeal, size: 18),
                label: const Text('Restart Onboarding Flow', style: TextStyle(color: AppTheme.primaryTeal, fontWeight: FontWeight.w700)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.primaryTeal),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  minimumSize: const Size.fromHeight(42),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => OnboardingIntroScreen(
                        onComplete: () => Navigator.pop(context),
                      ),
                    ),
                  );
                },
              ),
            ],

          ),
        ),
      ),
    );
  }

  Widget _routeChip(String label, int index) {
    final isSel = _currentIndex == index;
    return ChoiceChip(
      label: Text(label),
      selected: isSel,
      selectedColor: AppTheme.accentTurquoiseLight,
      onSelected: (_) {
        setState(() => _currentIndex = index);
        Navigator.pop(context);
      },
    );
  }
}
