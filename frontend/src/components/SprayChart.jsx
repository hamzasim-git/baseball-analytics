import { useRef, useEffect, useState } from 'react'

const HIT_COLORS = {
    'home_run': '#E8291C',
    'triple': '#ff8800',
    'double': '#f5c518',
    'single': '#00b341',
    'field_out': 'rgba(150,150,150,0.5)',
    'force_out': 'rgba(150,150,150,0.5)',
    'grounded_into_double_play': 'rgba(150,150,150,0.5)',
    'double_play': 'rgba(150,150,150,0.5)',
    'sac_fly': 'rgba(150,150,150,0.4)',
    'sac_bunt': 'rgba(150,150,150,0.4)',
    'fielders_choice': 'rgba(150,150,150,0.4)',
    'fielders_choice_out': 'rgba(150,150,150,0.4)',
}

const HIT_LABELS = {
    'home_run': 'Home Run',
    'triple': 'Triple',
    'double': 'Double',
    'single': 'Single',
    'field_out': 'Out',
}

function getHitColor(hitType) {
    return HIT_COLORS[hitType] || 'rgba(150,150,150,0.4)'
}

function SprayChart({ data, darkMode }) {
    const canvasRef = useRef(null)
    const [tooltip, setTooltip] = useState(null)

    useEffect(() => {
        if (!data || data.length === 0) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        drawField(ctx, canvas.width, canvas.height)
        drawDots(ctx, canvas.width, canvas.height, data)
    }, [data])

    const drawField = (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h)

        // Background
        ctx.fillStyle = darkMode ? '#0a0f1e' : '#f4f6f9'
        ctx.fillRect(0, 0, w, h)

        const cx = w / 2
        const cy = h * 0.85
        const scale = w * 0.38

        // Outfield grass
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx - scale * 0.98, cy - scale * 0.28)
        ctx.arc(cx, cy - scale * 0.6, scale * 1.05, Math.PI + 0.27, -0.27)
        ctx.lineTo(cx, cy)
        ctx.fillStyle = '#2d5a27'
        ctx.fill()

        // Outfield warning track
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx - scale * 0.95, cy - scale * 0.26)
        ctx.arc(cx, cy - scale * 0.6, scale * 1.0, Math.PI + 0.28, -0.28)
        ctx.lineTo(cx, cy)
        ctx.fillStyle = '#8B6914'
        ctx.fill()

        // Infield grass
        ctx.beginPath()
        ctx.arc(cx, cy - scale * 0.6, scale * 0.88, Math.PI + 0.28, -0.28)
        ctx.lineTo(cx, cy)
        ctx.fillStyle = '#2d5a27'
        ctx.fill()

        // Infield dirt
        ctx.beginPath()
        ctx.arc(cx, cy, scale * 0.5, Math.PI, 2 * Math.PI)
        ctx.fillStyle = '#8B6914'
        ctx.fill()

        // Infield grass overlay (diamond area)
        ctx.beginPath()
        ctx.arc(cx, cy, scale * 0.42, Math.PI, 2 * Math.PI)
        ctx.fillStyle = '#2d5a27'
        ctx.fill()

        // Pitcher's mound
        ctx.beginPath()
        ctx.arc(cx, cy - scale * 0.28, scale * 0.05, 0, Math.PI * 2)
        ctx.fillStyle = '#8B6914'
        ctx.fill()

        // Base paths
        const baseDist = scale * 0.28
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5

        // Diamond
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + baseDist, cy - baseDist)
        ctx.lineTo(cx, cy - baseDist * 2)
        ctx.lineTo(cx - baseDist, cy - baseDist)
        ctx.closePath()
        ctx.stroke()

        // Foul lines
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx - scale * 0.98, cy - scale * 0.28)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + scale * 0.98, cy - scale * 0.28)
        ctx.stroke()

        // Bases
        const bases = [
            [cx + baseDist, cy - baseDist],
            [cx, cy - baseDist * 2],
            [cx - baseDist, cy - baseDist],
        ]
        bases.forEach(([bx, by]) => {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(bx - 5, by - 5, 10, 10)
        })

        // Home plate
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fill()
    }

    const getCoords = (hcX, hcY, w, h) => {
        const cx = w / 2
        const cy = h * 0.85
        const scale = w * 0.42

        // Statcast hc_x: 0-250 left to right
        // Statcast hc_y: 0-250 top to bottom (inverted)
        const normX = (hcX - 125) / 125
        const normY = (hcY - 205) / 125

        return {
            x: cx + normX * scale,
            y: cy + normY * scale
        }
    }

    const drawDots = (ctx, w, h, hits) => {
        // Draw outs first so hits appear on top
        const order = ['field_out', 'force_out', 'grounded_into_double_play',
            'double_play', 'fielders_choice', 'fielders_choice_out',
            'sac_fly', 'single', 'double', 'triple', 'home_run']

        order.forEach(hitType => {
            hits.filter(h => h.hit_type === hitType).forEach(hit => {
                if (!hit.coord_x || !hit.coord_y) return
                const { x, y } = getCoords(hit.coord_x, hit.coord_y, w, h)
                const color = getHitColor(hit.hit_type)
                const isXBH = ['home_run', 'triple', 'double'].includes(hit.hit_type)

                if (isXBH) {
                    ctx.shadowColor = color
                    ctx.shadowBlur = 8
                }
                ctx.fillStyle = color
                ctx.beginPath()
                ctx.arc(x, y, isXBH ? 6 : 4, 0, Math.PI * 2)
                ctx.fill()
                ctx.shadowBlur = 0
            })
        })
    }

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width)
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height)
        const w = canvas.width
        const h = canvas.height

        let found = null
        let minDist = 12
        data.forEach(hit => {
            if (!hit.coord_x || !hit.coord_y) return
            const { x, y } = getCoords(hit.coord_x, hit.coord_y, w, h)
            const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)
            if (dist < minDist) {
                minDist = dist
                found = hit
            }
        })

        if (found) {
            setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, data: found })
        } else {
            setTooltip(null)
        }
    }

    // Count by type for legend
    const counts = {}
    data.forEach(h => {
        const key = ['home_run', 'triple', 'double', 'single'].includes(h.hit_type)
            ? h.hit_type : 'out'
        counts[key] = (counts[key] || 0) + 1
    })

    const legendItems = [
        { key: 'home_run', label: 'Home Run', color: '#E8291C' },
        { key: 'triple', label: 'Triple', color: '#ff8800' },
        { key: 'double', label: 'Double', color: '#f5c518' },
        { key: 'single', label: 'Single', color: '#00b341' },
        { key: 'out', label: 'Out', color: 'rgba(150,150,150,0.7)' },
    ]

    return (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    width={480}
                    height={460}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ borderRadius: '12px', cursor: 'crosshair', display: 'block' }}
                />
                {tooltip && (
                    <div style={{
                        position: 'absolute',
                        left: tooltip.x + 12,
                        top: tooltip.y - 10,
                        backgroundColor: darkMode ? '#0f1729' : '#ffffff',
                        border: `1px solid ${darkMode ? '#1e2d4a' : '#dde3ed'}`,
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '12px',
                        pointerEvents: 'none',
                        zIndex: 100,
                        minWidth: '170px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            color: getHitColor(tooltip.data.hit_type),
                            fontWeight: '700',
                            marginBottom: '6px',
                            fontSize: '13px'
                        }}>
                            {HIT_LABELS[tooltip.data.hit_type] || tooltip.data.hit_type.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div style={{ color: darkMode ? '#7a8fa6' : '#5a6a7e', lineHeight: 1.8 }}>
                            <div>Date: {tooltip.data.date}</div>
                            {tooltip.data.distance_ft && <div>Distance: {tooltip.data.distance_ft} ft</div>}
                            {tooltip.data.exit_velocity && <div>Exit Velo: {tooltip.data.exit_velocity} mph</div>}
                            {tooltip.data.launch_angle && <div>Launch Angle: {tooltip.data.launch_angle}°</div>}
                            <div>{tooltip.data.away_team} @ {tooltip.data.home_team}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{ paddingTop: '20px', minWidth: '140px' }}>
                <div style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.12em',
                    color: darkMode ? '#7a8fa6' : '#5a6a7e',
                    marginBottom: '12px'
                }}>
                    HIT TYPE
                </div>
                {legendItems.map(item => (
                    <div key={item.key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        marginBottom: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: item.color,
                                flexShrink: 0
                            }} />
                            <span style={{
                                fontSize: '12px',
                                color: darkMode ? '#cdd9e5' : '#0a1628'
                            }}>
                                {item.label}
                            </span>
                        </div>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: darkMode ? '#7a8fa6' : '#5a6a7e'
                        }}>
                            {counts[item.key] || 0}
                        </span>
                    </div>
                ))}
                <div style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: `1px solid ${darkMode ? '#1e2d4a' : '#dde3ed'}`,
                    fontSize: '12px',
                    color: darkMode ? '#7a8fa6' : '#5a6a7e'
                }}>
                    Total: <strong style={{ color: darkMode ? '#ffffff' : '#0a1628' }}>{data.length}</strong>
                </div>
            </div>
        </div>
    )
}

export default SprayChart