import { hashSingleUseToken, useCurrentTime } from '../lib' // Adjust the import path as needed
import { act, renderHook } from '@testing-library/react'

describe('useCurrentTime Hook', () => {
	it('should return the current time in milliseconds initially', () => {
		const initialTime = Date.now()
		const { result } = renderHook(() => useCurrentTime())
		expect(result.current).toBeGreaterThanOrEqual(initialTime)
		expect(result.current).toBeLessThanOrEqual(initialTime + 50) // Allow for a small margin
	})

	it('should update the time after the default refresh period (1000ms)', () => {
		jest.useFakeTimers() // Enable Jest's fake timers
		const { result } = renderHook(() => useCurrentTime())
		const initialTime = result.current

		act(() => {
			jest.advanceTimersByTime(1000) // Advance the timers by the default refresh period
		})

		const nextSecond = Math.ceil((initialTime + 1) / 1000) * 1000 // Round to the next second
		expect(result.current).toBeGreaterThanOrEqual(nextSecond)
		expect(result.current).toBeLessThanOrEqual(nextSecond + 50) // Allow for a small margin
	})

	it('should update the time after a custom refresh period', () => {
		jest.useFakeTimers() // Enable Jest's fake timers
		const refreshPeriod = 500
		const { result } = renderHook(() => useCurrentTime(refreshPeriod))
		const initialTime = result.current

		act(() => {
			jest.advanceTimersByTime(refreshPeriod)
		})

		const nextInterval = Math.ceil((initialTime + 1) / refreshPeriod) * refreshPeriod // Round to the next refreshPeriod
		expect(result.current).toBeGreaterThanOrEqual(nextInterval - 50)
		expect(result.current).toBeLessThanOrEqual(nextInterval + 50) // Allow for a small margin
	})

	it('should clear the timeout on unmount', () => {
		const { unmount } = renderHook(() => useCurrentTime())
		const mockClearTimeout = jest.spyOn(global, 'clearTimeout')

		unmount()

		expect(mockClearTimeout).toHaveBeenCalledTimes(1)
		// You could also assert that the timeout ID stored in the ref was passed to clearTimeout
	})
})

describe('hashSingleUseToken', () => {
	it('should return a specific string', async () => {
		expect(hashSingleUseToken('A string')).toMatchInlineSnapshot(`"yiFbyIc_jMd_9M7lEvhab3Rwl_0_"`)

		expect(hashSingleUseToken('Another string')).toMatchInlineSnapshot(`"Dq5ZWX0XCk4k8WZOjFnR2jcIG_Y_"`)

		expect(hashSingleUseToken('Something else')).toMatchInlineSnapshot(`"H4V7Cw1D7X7uXb8X0Cxso9fGyvg_"`)

		expect(
			hashSingleUseToken('A slightly longer string can go here. It should make no difference.')
		).toMatchInlineSnapshot(`"PFRNvvlom87xVeaU37SRgsTU1zU_"`)
	})
})
