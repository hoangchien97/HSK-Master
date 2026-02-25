import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(236, 19, 30, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(249, 115, 22, 0.12)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 60px',
            textAlign: 'center',
          }}
        >
          {/* Brand badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              padding: '10px 28px',
              borderRadius: '50px',
              background: 'linear-gradient(90deg, #ec131e, #f97316)',
              color: 'white',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '2px',
            }}
          >
            🏆 RUBY HSK
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '20px',
              maxWidth: '900px',
            }}
          >
            Trung tâm tiếng Trung
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #fbbf24, #f97316, #ec131e)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.2,
              marginBottom: '28px',
            }}
          >
            uy tín tại Hà Nội
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.5,
              maxWidth: '750px',
              marginBottom: '32px',
            }}
          >
            Đào tạo HSK 1-6 • Giao tiếp • Thương mại
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            {['8+ năm kinh nghiệm', 'Cam kết đầu ra', 'Học thử miễn phí'].map(
              (text) => (
                <div
                  key={text}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 500,
                  }}
                >
                  ✓ {text}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #fbbf24, #f97316, #ec131e)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
