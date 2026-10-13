import { render } from '@testing-library/react';
import FeatureIcon from './FeatureIcon';
import { describe, it, expect } from 'vitest';

describe('FeatureIcon Component', () => {
  it('renders wifi icon without error', () => {
    const { container } = render(<FeatureIcon name="wifi" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders fallback icon for unknown icon name', () => {
    const { container } = render(<FeatureIcon name="unknown_feature" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
