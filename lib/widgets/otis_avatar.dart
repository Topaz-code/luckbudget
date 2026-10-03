import 'package:flutter/material.dart';

enum OtisPose {
  book, // 01 Learn / Budget
  tux, // 02 Grow
  money, // 03 Save
  safe, // 04 Protect / Save with safe
  confetti, // 05 Celebrate / Success
  sad, // 06 Empty state / Error
}

class OtisAvatar extends StatelessWidget {
  final OtisPose pose;
  final double height;
  final double? width;
  final BoxFit fit;

  const OtisAvatar({
    super.key,
    required this.pose,
    this.height = 120,
    this.width,
    this.fit = BoxFit.contain,
  });

  String get assetPath {
    switch (pose) {
      case OtisPose.book:
        return 'assets/images/01_otis_book.png';
      case OtisPose.tux:
        return 'assets/images/02_otis_tux.png';
      case OtisPose.money:
        return 'assets/images/03_otis_money.png';
      case OtisPose.safe:
        return 'assets/images/04_otis_safe.png';
      case OtisPose.confetti:
        return 'assets/images/05_otis_confetti.png';
      case OtisPose.sad:
        return 'assets/images/06_otis_sad.png';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      assetPath,
      height: height,
      width: width,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          height: height,
          width: width ?? height,
          decoration: BoxDecoration(
            color: const Color(0xFF37B1A7).withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.pets,
            color: Color(0xFF37B1A7),
            size: 32,
          ),
        );
      },
    );
  }
}
