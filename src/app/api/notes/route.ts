import { NextRequest, NextResponse } from 'next/server';
import { Note } from '@/shared/lib/types';

// Simulate an in-memory database (in production, use a real database)
let notesDb: Note[] = [];

/**
 * GET /api/notes
 * Retrieve all notes or notes by folder
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');

    let results = notesDb;
    if (parentId) {
      results = notesDb.filter(note => note.parentId === parentId);
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Create a new note
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Note;

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newNote: Note = {
      ...body,
      id: Date.now().toString(),
      updatedAt: Date.now(),
      attachments: body.attachments || [],
      date: body.date || new Date().toLocaleDateString()
    };

    notesDb.push(newNote);

    return NextResponse.json(
      { success: true, data: newNote },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notes
 * Update a note
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Note;

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Note ID required' },
        { status: 400 }
      );
    }

    const index = notesDb.findIndex(n => n.id === body.id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    const updatedNote: Note = {
      ...notesDb[index],
      ...body,
      updatedAt: Date.now()
    };

    notesDb[index] = updatedNote;

    return NextResponse.json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes
 * Delete a note
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'Note ID required' },
        { status: 400 }
      );
    }

    const index = notesDb.findIndex(n => n.id === noteId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    const deletedNote = notesDb.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedNote
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
