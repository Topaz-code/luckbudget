import 'package:flutter/cupertino.dart';
import '../theme/app_colors.dart';

class AppToggle extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const AppToggle({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return CupertinoSwitch(
      value: value,
      activeTrackColor: AppColors.accentTurquoise,
      inactiveTrackColor: AppColors.borderLight,
      onChanged: onChanged,
    );
  }
}
