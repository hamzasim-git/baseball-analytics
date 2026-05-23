import { useRef, useEffect, useState } from 'react'

function PitchHeatmap({ data }) {
    const canvasRef = useRef(null)
    const [tooltip, setTooltip] = useState(null)

    const PITCH_COLORS = {
        'FF': '#ff4444',
        'SI': '#ff8800',
        'FC': '#ffaa00',
        'SL': '#4488ff',
        'CU': '#44bbff',
        'CH': '#44ff88',
        'FS': '#aa44ff',
        'KC': '#ff44aa',
    }

    const drawStrikeZone = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, w, h)

    const zoneLeft = w * 0.3
    const zoneRight = w * 0.7
    const zoneTop = h * 0.2
    const zoneBottom = h * 0.65

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(zoneLeft, zoneTop, zoneRight - zoneLeft, zoneBottom - zoneTop)

    ctx.fillStyle = '#8b949e'
    ctx.font = '11px Inter'
    ctx.fillText('STRIKE ZONE', zoneLeft, zoneTop - 8)

    ctx.strokeStyle = '#555'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w * 0.2, h * 0.78)
    ctx.lineTo(w * 0.8, h * 0.78)
    ctx.stroke()
}

    const getCoords = (plateX, plateZ, w, h) => {
        const x = w * 0.5 + (plateX / 1.5) * (w * 0.2)
        const y = h * 0.65 - ((plateZ - 1.5) / 2.5) * (h * 0.45)
        return { x, y }
    }

    useEffect(() => {
        if (!data || data.length === 0) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        drawStrikeZone(ctx, canvas.width, canvas.height)
        drawPitches(ctx, canvas.width, canvas.height, data)
    }, [data])



    const drawPitches = (ctx, w, h, pitches) => {
        pitches.forEach(pitch => {
            if (pitch.plate_x === null || pitch.plate_z === null) return
            const { x, y } = getCoords(pitch.plate_x, pitch.plate_z, w, h)
            const color = PITCH_COLORS[pitch.pitch_type] || '#888888'

            ctx.globalAlpha = 0.6
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
        })
    }

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const w = canvas.width
        const h = canvas.height

        let found = null
        data.forEach(pitch => {
            if (pitch.plate_x === null || pitch.plate_z === null) return
            const { x, y } = getCoords(pitch.plate_x, pitch.plate_z, w, h)
            const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)
            if (dist < 8) found = pitch
        })

        if (found) {
            setTooltip({ x: mouseX, y: mouseY, data: found })
        } else {
            setTooltip(null)
        }
    }

    // Legend
    const pitchNames = {
        'FF': '4-Seam Fastball', 'SI': 'Sinker', 'FC': 'Cutter',
        'SL': 'Slider', 'CU': 'Curveball', 'CH': 'Changeup',
        'FS': 'Splitter', 'KC': 'Knuckle Curve'
    }

    const pitchTypes = [...new Set(data.map(p => p.pitch_type))].filter(Boolean)

    return (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={450}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ borderRadius: '8px', cursor: 'crosshair' }}
                />
                {tooltip && (
                    <div style={{
                        position: 'absolute',
                        left: tooltip.x + 10,
                        top: tooltip.y - 10,
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        pointerEvents: 'none',
                        zIndex: 100,
                        minWidth: '160px'
                    }}>
                        <div style={{ color: PITCH_COLORS[tooltip.data.pitch_type] || '#fff', fontWeight: '600', marginBottom: '4px' }}>
                            {pitchNames[tooltip.data.pitch_type] || tooltip.data.pitch_type}
                        </div>
                        <div>Velocity: {tooltip.data.pitch_velocity} mph</div>
                        <div>Result: {tooltip.data.pitch_result}</div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '20px' }}>
                <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>PITCH TYPES</div>
                {pitchTypes.map(pt => (
                    <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: PITCH_COLORS[pt] || '#888' }} />
                        <span style={{ color: '#ccc' }}>{pitchNames[pt] || pt}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PitchHeatmap