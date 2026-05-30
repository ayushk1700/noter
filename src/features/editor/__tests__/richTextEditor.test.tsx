import React from 'react';
import { render, screen } from '@testing-library/react';
import RichTextEditor from '../components/RichTextEditor';

describe('RichTextEditor (setup)', () => {
  it('renders toolbar and editor canvas', () => {
    render(<RichTextEditor />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('editor-canvas')).toBeInTheDocument();
  });
});
