import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../theme/app_colors.dart';

/// Interactive 3D Globe Widget with Earth Texture
/// 
/// A realistic rotating globe with day view texture, proper lighting,
/// and interactive drag controls.
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
  double _lastDragX = 0.0;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      duration: const Duration(seconds: 60),
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

  void _handleDragStart(DragStartDetails details) {
    _lastDragX = details.globalPosition.dx;
    _rotationController.stop();
  }

  void _handleDragUpdate(DragUpdateDetails details) {
    final dragDelta = details.globalPosition.dx - _lastDragX;
    _lastDragX = details.globalPosition.dx;

    setState(() {
      _dragRotation += dragDelta * 0.01;
      _verticalRotation = (_verticalRotation + details.delta.dy * 0.01)
          .clamp(-0.3, 0.3);
    });
  }

  void _handleDragEnd(DragEndDetails details) {
    if (widget.autoRotate) {
      _rotationController.repeat();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.0,
      child: GestureDetector(
        onHorizontalDragStart: _handleDragStart,
        onHorizontalDragUpdate: _handleDragUpdate,
        onHorizontalDragEnd: _handleDragEnd,
        onVerticalDragStart: _handleDragStart,
        onVerticalDragUpdate: _handleDragUpdate,
        onVerticalDragEnd: _handleDragEnd,
        child: AnimatedBuilder(
          animation: _rotationController,
          builder: (context, child) {
            final rotation = _rotationController.value * 2 * math.pi;
            return Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.001)
                ..rotateY(rotation + _dragRotation)
                ..rotateX(_verticalRotation),
              child: child,
            );
          },
          child: _buildGlobeWithTexture(),
        ),
      ),
    );
  }

  /// Build globe with realistic earth texture and lighting
  Widget _buildGlobeWithTexture() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Main globe with earth texture
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              // Ambient shadow beneath globe
              BoxShadow(
                color: Colors.black.withAlpha((0.3 * 255).toInt()),
                blurRadius: 25,
                spreadRadius: 8,
                offset: const Offset(0, 12),
              ),
              // Subtle glow
              BoxShadow(
                color: AppColors.primary.withAlpha((0.15 * 255).toInt()),
                blurRadius: 15,
                spreadRadius: 3,
              ),
            ],
          ),
          child: CustomPaint(
            painter: EarthTexturePainter(),
            size: const Size.square(400),
          ),
        ),
        // Soft lighting overlay
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                Colors.white.withAlpha((0.08 * 255).toInt()),
                Colors.transparent,
              ],
              stops: const [0.0, 0.7],
            ),
          ),
        ),
      ],
    );
  }
}

/// Custom painter for realistic earth texture
class EarthTexturePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Ocean color
    canvas.drawCircle(
      center,
      radius,
      Paint()..color = const Color(0xFF1E5C99), // Deep ocean blue
    );

    // Draw continents with simplified shapes
    _drawContinents(canvas, center, radius);

    // Add subtle cloud patterns
    _drawAtmosphere(canvas, center, radius);

    // Subtle specular highlight (light reflection)
    _drawSpecularHighlight(canvas, center, radius);
  }

  void _drawContinents(Canvas canvas, Offset center, double radius) {
    // Continental shapes (simplified representations)
    final continentPaint = Paint()..color = const Color(0xFF2D7A3E); // Green land

    // North America
    _drawContinent(
      canvas,
      center,
      radius,
      Offset(-0.25, -0.15),
      0.12,
      continentPaint,
    );

    // South America
    _drawContinent(
      canvas,
      center,
      radius,
      Offset(-0.18, 0.25),
      0.08,
      continentPaint,
    );

    // Europe & Africa
    _drawContinent(
      canvas,
      center,
      radius,
      Offset(0.05, 0.1),
      0.15,
      continentPaint,
    );

    // Asia
    _drawContinent(
      canvas,
      center,
      radius,
      Offset(0.25, -0.1),
      0.18,
      continentPaint,
    );

    // Australia
    _drawContinent(
      canvas,
      center,
      radius,
      Offset(0.3, 0.3),
      0.06,
      continentPaint,
    );

    // Antarctica (southern ice cap)
    canvas.drawCircle(
      Offset(center.dx, center.dy + radius * 0.9),
      radius * 0.12,
      Paint()..color = const Color(0xFFE8F4F8), // Ice white
    );
  }

  void _drawContinent(
    Canvas canvas,
    Offset center,
    double radius,
    Offset position,
    double size,
    Paint paint,
  ) {
    final continentCenter = Offset(
      center.dx + position.dx * radius,
      center.dy + position.dy * radius,
    );
    
    final path = Path()..addOval(Rect.fromCircle(
      center: continentCenter,
      radius: size * radius,
    ));
    
    canvas.drawPath(path, paint);
  }

  void _drawAtmosphere(Canvas canvas, Offset center, double radius) {
    // Thin atmospheric layer with clouds
    final atmospherePaint = Paint()
      ..color = Colors.white.withAlpha((0.08 * 255).toInt())
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    canvas.drawCircle(center, radius + 2, atmospherePaint);

    // Subtle cloud bands
    final cloudPaint = Paint()
      ..color = Colors.white.withAlpha((0.1 * 255).toInt())
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    // Tropical cloud band
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius * 0.85),
      -math.pi / 6,
      math.pi / 3,
      false,
      cloudPaint,
    );
  }

  void _drawSpecularHighlight(Canvas canvas, Offset center, double radius) {
    // Subtle light reflection on upper left
    final highlightPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          Colors.white.withAlpha((0.25 * 255).toInt()),
          Colors.white.withAlpha((0.0 * 255).toInt()),
        ],
        stops: const [0.0, 1.0],
      ).createShader(
        Rect.fromCircle(
          center: Offset(center.dx - radius * 0.3, center.dy - radius * 0.3),
          radius: radius * 0.25,
        ),
      );

    canvas.drawCircle(
      Offset(center.dx - radius * 0.3, center.dy - radius * 0.3),
      radius * 0.25,
      highlightPaint,
    );
  }

  @override
  bool shouldRepaint(EarthTexturePainter oldDelegate) => false;
}
