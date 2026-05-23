import { useRef, useEffect, useState } from 'react'

function SprayChart({ data }) {
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

        // Grass background
        ctx.fillStyle = '#1a472a'
        ctx.beginPath()
        ctx.arc(w / 2, h * 0.92, h * 0.88, Math.PI, 2 * Math.PI)
        ctx.fill()

        // Infield dirt
        ctx.fillStyle = '#8B6914'
        ctx.beginPath()
        ctx.arc(w / 2, h * 0.92, h * 0.35, Math.PI, 2 * Math.PI)
        ctx.fill()

        // Infield grass
        ctx.fillStyle = '#1a472a'
        ctx.beginPath()
        ctx.arc(w / 2, h * 0.92, h * 0.28, Math.PI, 2 * Math.PI)
        ctx.fill()

        // Foul lines
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(w / 2, h * 0.92)
        ctx.lineTo(w * 0.05, h * 0.08)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(w / 2, h * 0.92)
        ctx.lineTo(w * 0.95, h * 0.08)
        ctx.stroke()

        // Home plate
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(w / 2, h * 0.92, 5, 0, Math.PI * 2)
        ctx.fill()
    }

    const getCoords = (hcX, hcY, w, h) => {
        // Statcast coordinates: hc_x goes left to right (0-250), hc_y goes top to bottom (0-250)
        const scaleX = w / 250
        const scaleY = h / 250
        return {
            x: hcX * scaleX,
            y: hcY * scaleY
        }
    }

    const drawDots = (ctx, w, h, hits) => {
        hits.forEach(hit => {
            if (!hit.coord_x || !hit.coord_y) return
            const { x, y } = getCoords(hit.coord_x, hit.coord_y, w, h)

            // Glow effect
            ctx.shadowColor = '#ff6b35'
            ctx.shadowBlur = 10
            ctx.fillStyle = '#ff6b35'
            ctx.beginPath()
            ctx.arc(x, y, 6, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
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
        data.forEach(hit => {
            if (!hit.coord_x || !hit.coord_y) return
            const { x, y } = getCoords(hit.coord_x, hit.coord_y, w, h)
            const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)
            if (dist < 12) found = hit
        })

        if (found) {
            setTooltip({
                x: mouseX,
                y: mouseY,
                data: found
            })
        } else {
            setTooltip(null)
        }
    }

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <canvas
                ref={canvasRef}
                width={500}
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
                    <div style={{ color: '#00d4aa', fontWeight: '600', marginBottom: '4px' }}>HOME RUN</div>
                    <div>Date: {tooltip.data.date}</div>
                    <div>Distance: {tooltip.data.distance_ft} ft</div>
                    <div>Exit Velo: {tooltip.data.exit_velocity} mph</div>
                    <div>Launch Angle: {tooltip.data.launch_angle}°</div>
                    <div>vs {tooltip.data.away_team} @ {tooltip.data.home_team}</div>
                </div>
            )}
        </div>
    )
}

export default SprayChart