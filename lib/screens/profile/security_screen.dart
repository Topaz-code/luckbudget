import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class SecurityScreen extends StatefulWidget {
  const SecurityScreen({super.key});

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  bool _biometricsEnabled = true;
  bool _requirePinForSpend = true;
  bool _cooldownLock = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Security & Lock Settings', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'App & Account Protection',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 6),
            const Text(
              'Enforce strict security locks to prevent impulsive or unauthorized spending.',
              style: TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),

            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Biometric Authentication', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Use FaceID / Fingerprint to open LockBudget'),
                    value: _biometricsEnabled,
                    activeThumbColor: AppTheme.accentTurquoise,
                    onChanged: (val) => setState(() => _biometricsEnabled = val),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Require PIN for Releases', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Ask for 4-digit security PIN before any spend release'),
                    value: _requirePinForSpend,
                    activeThumbColor: AppTheme.accentTurquoise,
                    onChanged: (val) => setState(() => _requirePinForSpend = val),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Savings Cooldown Lock', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Require 48 hours waiting period before early save unlock'),
                    value: _cooldownLock,
                    activeThumbColor: AppTheme.accentTurquoise,
                    onChanged: (val) => setState(() => _cooldownLock = val),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.cardBorder),
              ),
              child: Column(
                children: [
                  ListTile(
                    title: const Text('Change Transaction PIN', style: TextStyle(fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('PIN reset instruction sent to registered phone number.')),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    title: const Text('Emergency Lock Override', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Set trusted guarantor for emergency funds unlock'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Guarantor verification wireframe opened.')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
