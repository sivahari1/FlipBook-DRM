import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CognitoAuthService } from '@/lib/cognito-auth'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  // Normalize params: Next's generated types may present params as a Promise
  // depending on the Next version / type generation. Support both shapes.
  let params: { id: string } | undefined
  try {
    const p = (context as any).params
    params = p && typeof (p as any).then === 'function' ? await p : p
  } catch (e) {
    params = (context as any).params
  }
  
  try {
    console.log('📋 Fetching document:', params?.id)
    
    // Get user email from request headers (passed from client)
    const userEmail = request.headers.get('x-user-email')
    
    console.log('👤 User email from header:', userEmail)
    
    // Find the document with owner information
    const document = await prisma.document.findUnique({
      where: { id: params?.id ?? '' },
      include: {
        owner: {
          select: { 
            id: true,
            email: true, 
            role: true 
          }
        }
      }
    })

    if (!document) {
      console.log('❌ Document not found:', params?.id ?? '(no id)')
      return NextResponse.json({
        error: 'Document not found'
      }, { status: 404 })
    }

    // If user email is provided, check permissions
    let canEdit = false
    let accessLevel = 'viewer'
    
    if (userEmail) {
      // Find the current user in the database
      const dbUser = await prisma.user.findUnique({
        where: { email: userEmail }
      })

      if (dbUser) {
        // Check permissions
        const isOwner = document.owner.id === dbUser.id
        const isCreatorOrSubscriber = ['CREATOR', 'SUBSCRIBER'].includes(dbUser.role)
        
        console.log('🔐 Permission check:', {
          isOwner,
          userRole: dbUser.role,
          isCreatorOrSubscriber,
          documentOwner: document.owner.email
        })

        canEdit = isOwner
        accessLevel = isOwner ? 'owner' : 'viewer'
        
        console.log('✅ Document access granted:', document.title)
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        description: document.description,
        pageCount: document.pageCount,
        createdAt: document.createdAt,
        owner: document.owner.email,
        hasPassphrase: document.hasPassphrase,
        drmOptions: JSON.parse(document.drmOptions || '{}'),
        canEdit,
        accessLevel
      }
    })

  } catch (error) {
    console.error('❌ Error fetching document:', error)
    
    return NextResponse.json({ 
      error: 'Failed to fetch document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  // Normalize params
  let params: { id: string } | undefined
  try {
    const p = (context as any).params
    params = p && typeof (p as any).then === 'function' ? await p : p
  } catch (e) {
    params = (context as any).params
  }

  try {
    console.log('🗑️ Deleting document:', params?.id)
    
    // Get user email from request headers
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Find the document with owner information
    const document = await prisma.document.findUnique({
      where: { id: params?.id ?? '' },
      include: {
        owner: {
          select: { 
            id: true,
            email: true, 
            role: true 
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({
        error: 'Document not found'
      }, { status: 404 })
    }

    // Find the current user
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!dbUser) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 403 })
    }

    // Check if user is the owner or has admin privileges
    const isOwner = document.owner.id === dbUser.id
    const isAdmin = dbUser.role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        error: 'Access denied. Only document owners can delete documents.'
      }, { status: 403 })
    }

    // Delete the document from database
    await prisma.document.delete({
      where: { id: params?.id ?? '' }
    })

    // Try to delete the physical file
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const uploadsDir = path.join(process.cwd(), 'uploads')
      const fileName = `${document.id}.pdf`
      const filePath = path.join(uploadsDir, fileName)
      
      await fs.unlink(filePath)
      console.log('✅ Physical file deleted:', fileName)
    } catch (fileError) {
      console.log('⚠️ Could not delete physical file:', fileError)
      // Don't fail the request if file deletion fails
    }

    console.log('✅ Document deleted successfully:', document.title)

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting document:', error)
    
    return NextResponse.json({ 
      error: 'Failed to delete document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}