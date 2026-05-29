import { NextRequest, NextResponse } from 'next/server';

interface Folder {
  id: string;
  name: string;
  color?: string;
  count?: number;
}

// Simulate an in-memory database
let foldersDb: Folder[] = [];

/**
 * GET /api/folders
 * Retrieve all folders
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: foldersDb,
      count: foldersDb.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/folders
 * Create a new folder
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Folder;

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Folder name required' },
        { status: 400 }
      );
    }

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: body.name,
      count: 0
    };

    foldersDb.push(newFolder);

    return NextResponse.json(
      { success: true, data: newFolder },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/folders
 * Update a folder
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Folder;

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Folder ID required' },
        { status: 400 }
      );
    }

    const index = foldersDb.findIndex(f => f.id === body.id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Folder not found' },
        { status: 404 }
      );
    }

    const updatedFolder: Folder = {
      ...foldersDb[index],
      ...body
    };

    foldersDb[index] = updatedFolder;

    return NextResponse.json({
      success: true,
      data: updatedFolder
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/folders
 * Delete a folder
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('id');

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'Folder ID required' },
        { status: 400 }
      );
    }

    const index = foldersDb.findIndex(f => f.id === folderId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Folder not found' },
        { status: 404 }
      );
    }

    const deletedFolder = foldersDb.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedFolder
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
