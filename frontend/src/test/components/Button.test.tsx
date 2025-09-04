import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
    it('should render with default props', () => {
        render(<Button>Click me</Button>)

        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('btn-base')
    })

    it('should handle click events', () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Click me</Button>)

        const button = screen.getByRole('button', { name: /click me/i })
        fireEvent.click(button)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when loading', () => {
        render(<Button loading>Loading button</Button>)

        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
        expect(screen.getByText('Loading button')).toBeInTheDocument()
    })

    it('should show loading spinner when loading', () => {
        render(<Button loading>Loading</Button>)

        // Loading spinner should be present
        const spinner = document.querySelector('svg')
        expect(spinner).toBeInTheDocument()
        expect(spinner).toHaveClass('animate-spin')
    })

    it('should apply variant classes correctly', () => {
        render(<Button variant="alderan">Alderan Button</Button>)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('gradient-bg-primary')
    })

    it('should apply size classes correctly', () => {
        render(<Button size="lg">Large Button</Button>)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('h-11')
    })

    it('should render left and right icons', () => {
        const LeftIcon = <span data-testid="left-icon">←</span>
        const RightIcon = <span data-testid="right-icon">→</span>

        render(
            <Button leftIcon={LeftIcon} rightIcon={RightIcon}>
                Button with icons
            </Button>
        )

        expect(screen.getByTestId('left-icon')).toBeInTheDocument()
        expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should not render right icon when loading', () => {
        const RightIcon = <span data-testid="right-icon">→</span>

        render(
            <Button loading rightIcon={RightIcon}>
                Loading with icon
            </Button>
        )

        expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled Button</Button>)

        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })

    it('should render as child component when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        )

        const link = screen.getByRole('link')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/test')
    })
})
