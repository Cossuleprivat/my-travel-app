import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../widgets/interactive_globe.dart';

/// Home Page - Main landing page with interactive 3D globe
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedCountry = 0;

  void _handleCountryTap(String countryCode) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Navigating to $countryCode...'),
        duration: const Duration(seconds: 2),
      ),
    );

    // Future navigation implementation:
    // Navigator.pushNamed(context, '/country/$countryCode');
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Travel App'),
        elevation: 0,
        backgroundColor: AppColors.primary,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Title Section
              Text(
                'Explore the World',
                style: AppTypography.heading1.copyWith(
                  color: AppColors.textLight,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Click on continents and countries to discover hidden gems',
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textLight.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

      // Interactive Globe Widget
              Container(
                constraints: BoxConstraints(
                  maxHeight: screenSize.height * 0.5,
                  maxWidth: screenSize.width * 0.9,
                ),
                child: InteractiveGlobe(
                  onCountryTap: _handleCountryTap,
                  autoRotate: true,
                ),
              ),
              const SizedBox(height: 32),

              // Information Section
              Card(
                color: AppColors.surface,
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'How to Use',
                        style: AppTypography.heading3.copyWith(
                          color: AppColors.accent,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildInfoItem(
                        'Rotate',
                        'Drag the globe horizontally to rotate it',
                      ),
                      const SizedBox(height: 8),
                      _buildInfoItem(
                        'Tilt',
                        'Drag vertically to tilt your view',
                      ),
                      const SizedBox(height: 8),
                      _buildInfoItem(
                        'Explore',
                        'Tap on any region to discover destinations',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Featured Destinations Section
              Text(
                'Featured Destinations',
                style: AppTypography.heading2.copyWith(
                  color: AppColors.textLight,
                ),
              ),
              const SizedBox(height: 16),
              _buildFeaturedDestinations(),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.explore),
            label: 'Explore',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Favorites',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: 'Map',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedCountry,
        onTap: (index) {
          setState(() {
            _selectedCountry = index;
          });
          _showTabMessage(index);
        },
      ),
    );
  }

  /// Build individual info item with icon and text
  Widget _buildInfoItem(String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.accent,
          ),
          child: Center(
            child: Text(
              '•',
              style: TextStyle(
                color: AppColors.background,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textLight,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                description,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textLight.withOpacity(0.7),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Build featured destinations grid
  Widget _buildFeaturedDestinations() {
    final destinations = [
      {'name': 'Paris', 'country': 'France'},
      {'name': 'Tokyo', 'country': 'Japan'},
      {'name': 'New York', 'country': 'USA'},
      {'name': 'Barcelona', 'country': 'Spain'},
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: destinations.map((destination) {
        return _buildDestinationCard(
          destination['name']!,
          destination['country']!,
        );
      }).toList(),
    );
  }

  /// Build individual destination card
  Widget _buildDestinationCard(String cityName, String countryName) {
    return Card(
      color: AppColors.surface,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary.withOpacity(0.6),
              AppColors.secondary.withOpacity(0.6),
            ],
          ),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Navigating to $cityName...'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    cityName,
                    style: AppTypography.heading3.copyWith(
                      color: AppColors.accent,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    countryName,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textLight.withOpacity(0.8),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Show message when bottom nav tab is tapped
  void _showTabMessage(int index) {
    final messages = [
      'Explore tab selected',
      'Favorites tab selected (coming soon)',
      'Map tab selected (coming soon)',
      'Profile tab selected (coming soon)',
    ];
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(messages[index]),
        duration: const Duration(seconds: 1),
      ),
    );
  }
}
