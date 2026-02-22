import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Interactive 3D Globe Widget
/// 
/// A rotating globe that displays countries and continents.
/// Users can tap on countries to navigate to detail pages.
class InteractiveGlobe extends StatefulWidget {
  final Function(String countryCode) onCountryTap;
  final bool autoRotate;

  const InteractiveGlobe({
    super.key,
    required this.onCountryTap,
    this.autoRotate = true,
  });

  @override
  State<InteractiveGlobe> createState() => _InteractiveGlobeState();
}

class _InteractiveGlobeState extends State<InteractiveGlobe>
    with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;
  double _dragRotation = 0.0;
  double _verticalRotation = 0.0;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    );

    if (widget.autoRotate) {
      _rotationController.repeat();
    }
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  void _handleDragUpdate(DragUpdateDetails details) {
    setState(() {
      _dragRotation += details.delta.dx * 0.01;
      _verticalRotation = (_verticalRotation + details.delta.dy * 0.01)
          .clamp(-0.5, 0.5);
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onHorizontalDragUpdate: _handleDragUpdate,
      onVerticalDragUpdate: _handleDragUpdate,
      child: AnimatedBuilder(
        animation: _rotationController,
        builder: (context, child) {
          final rotation = _rotationController.value * 2 * 3.14159265359;
          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(rotation + _dragRotation)
              ..rotateX(_verticalRotation),
            child: child,
          );
        },
        child: _buildGlobeContent(),
      ),
    );
  }

  /// Build the globe with countries and interactive regions
  Widget _buildGlobeContent() {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            AppColors.primary,
            AppColors.primary.withOpacity(0.8),
          ],
          radius: 0.8,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Globe base
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  AppColors.primary.withOpacity(0.9),
                  AppColors.primary,
                ],
              ),
            ),
          ),
          // Interactive country regions
          ..._buildCountryRegions(),
        ],
      ),
    );
  }

  /// Build tappable country regions
  List<Widget> _buildCountryRegions() {
    final countries = [
      {'name': 'US', 'code': 'US', 'offset': Offset(0.15, 0.2)},
      {'name': 'Europe', 'code': 'EU', 'offset': Offset(-0.15, 0.1)},
      {'name': 'Asia', 'code': 'AS', 'offset': Offset(0.3, 0.15)},
      {'name': 'Africa', 'code': 'AF', 'offset': Offset(0.0, 0.35)},
      {'name': 'South America', 'code': 'SA', 'offset': Offset(-0.2, 0.25)},
      {'name': 'Australia', 'code': 'AU', 'offset': Offset(0.25, 0.45)},
    ];

    return countries.map((country) {
      final offset = country['offset'] as Offset;
      final code = country['code'] as String;
      final name = country['name'] as String;

      return Positioned(
        left: 200 + (offset.dx * 180),
        top: 200 + (offset.dy * 180),
        child: GestureDetector(
          onTap: () {
            widget.onCountryTap(code);
          },
          child: Tooltip(
            message: name,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.secondary.withOpacity(0.7),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accent,
                    blurRadius: 8,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    widget.onCountryTap(code);
                  },
                  customBorder: const CircleBorder(),
                  child: Center(
                    child: Text(
                      code.substring(0, 1),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }).toList();
  }
}
