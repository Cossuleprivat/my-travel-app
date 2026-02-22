/// Data model for countries
class Country {
  final String code;
  final String name;
  final String description;
  final String capital;
  final String region;

  Country({
    required this.code,
    required this.name,
    required this.description,
    required this.capital,
    required this.region,
  });
}
