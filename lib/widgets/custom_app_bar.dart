import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../screens/profile/profile_sheet.dart';
import '../screens/profile/help_support_screen.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String subtitle;
  final VoidCallback? onNotificationTap;

  const CustomAppBar({
    super.key,
    this.title = 'Hi, Yakubu manage',
    this.subtitle = 'Spend from the plan',
    this.onNotificationTap,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // User Avatar with quick-open profile
          GestureDetector(
            onTap: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (context) => const ProfileSheet(),
              );
            },
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppTheme.accentTurquoiseLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(
                child: Icon(
                  Icons.person,
                  color: AppTheme.primaryTeal,
                  size: 24,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Greeting & Subtitle
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),

            // Action Icons: Bell & Headset
            IconButton(
              icon: Stack(
                children: [
                  const Icon(
                    Icons.notifications_none_outlined,
                    color: AppTheme.primaryTeal,
                    size: 24,
                  ),
                  Positioned(
                    right: 2,
                    top: 2,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppTheme.accentTurquoise,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
              onPressed: onNotificationTap ??
                  () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Notifications: Budget plan active. ₦7,500 available today.'),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
            ),
            IconButton(
              icon: const Icon(
                Icons.headset_mic_outlined,
                color: AppTheme.primaryTeal,
                size: 24,
              ),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const HelpSupportScreen(),
                  ),
                );
              },
            ),
          ],
        ),
      );
  }
}
