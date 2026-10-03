enum KycTier { tier1, tier2, tier3 }

class UserProfile {
  final String id;
  final String firstName;
  final String surname;
  final String email;
  final String phoneNumber;
  final KycTier kycTier;
  final bool isBiometricsEnabled;
  final bool hasPinConfigured;

  const UserProfile({
    required this.id,
    required this.firstName,
    required this.surname,
    required this.email,
    required this.phoneNumber,
    this.kycTier = KycTier.tier1,
    this.isBiometricsEnabled = true,
    this.hasPinConfigured = true,
  });

  String get displayName => '$firstName $surname';
}

abstract class UserRepository {
  Future<UserProfile> getUserProfile();
  Future<void> updateProfile({String? firstName, String? surname, String? email});
  Future<bool> verifyPin(String pin);
  Future<void> setBiometricsEnabled(bool enabled);
  Future<bool> upgradeKycTier({required String bvnOrNin});
}
