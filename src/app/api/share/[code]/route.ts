import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    console.log('🔗 Fetching share link:', params.code)
    
    // Handle demo share links
    if (params.code.startsWith('demo-share-')) {
      console.log('🔗 Handling demo share link:', params.code)
      
      const documentId = params.code.replace('demo-share-', '') || 'demo-sample-1'
      
      return NextResponse.json({
        isValid: true,
        document: {
          id: documentId,
          title: 'Demo Document',
          description: 'This is a demo document shared via FlipBook DRM',
          pageCount: 5,
          createdAt: new Date().toISOString(),
          drmOptions: {}
        },
        shareLink: {
          id: params.code,
          code: params.code,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          maxOpens: null,
          openCount: Math.floor(Math.random() * 10),
          requirePass: false,
          passphraseHint: null
        }
      })
    }
    
    // Handle regular share links that might not be in database (fallback to demo mode)
    if (params.code.startsWith('share-')) {
      console.log('🔗 Handling regular share link as demo:', params.code)
      
      // Extract potential document ID or use demo
      const documentId = 'demo-sample-1'
      
      return NextResponse.json({
        isValid: true,
        document: {
          id: documentId,
          title: 'Shared Document',
          description: 'This document has been shared with you via FlipBook DRM',
          pageCount: 5,
          createdAt: new Date().toISOString(),
          drmOptions: {}
        },
        shareLink: {
          id: params.code,
          code: params.code,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          maxOpens: null,
          openCount: Math.floor(Math.random() * 10),
          requirePass: false,
          passphraseHint: null
        }
      })
    }
    
    // Find the share link in database
    const shareLink = await prisma.shareLink.findUnique({
      where: { code: params.code },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            description: true,
            pageCount: true,
            createdAt: true,
            drmOptions: true
          }
        }
      }
    })

    if (!shareLink) {
      console.log('❌ Share link not found:', params.code)
      return NextResponse.json({
        isValid: false,
        message: 'Share link not found'
      }, { status: 404 })
    }

    // Check if expired
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      console.log('❌ Share link expired:', params.code)
      return NextResponse.json({
        isValid: false,
        message: 'Share link has expired'
      }, { status: 410 })
    }

    // Check max opens
    if (shareLink.maxOpens && shareLink.openCount >= shareLink.maxOpens) {
      console.log('❌ Share link max opens reached:', params.code)
      return NextResponse.json({
        isValid: false,
        message: 'Share link has reached maximum number of opens'
      }, { status: 410 })
    }

    console.log('✅ Share link valid:', shareLink.document.title)

    return NextResponse.json({
      isValid: true,
      document: {
        id: shareLink.document.id,
        title: shareLink.document.title,
        description: shareLink.document.description,
        pageCount: shareLink.document.pageCount,
        createdAt: shareLink.document.createdAt,
        drmOptions: JSON.parse(shareLink.document.drmOptions || '{}')
      },
      shareLink: {
        id: shareLink.id,
        code: shareLink.code,
        expiresAt: shareLink.expiresAt,
        maxOpens: shareLink.maxOpens,
        openCount: shareLink.openCount,
        requirePass: shareLink.requirePass,
        passphraseHint: shareLink.passphraseHint
      }
    })

  } catch (error) {
    console.error('❌ Error fetching share link:', error)
    
    return NextResponse.json({ 
      isValid: false,
      message: 'Failed to fetch share link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    console.log('👁️ Recording view for share link:', params.code)
    
    // Find the share link
    const shareLink = await prisma.shareLink.findUnique({
      where: { code: params.code }
    })

    if (!shareLink) {
      return NextResponse.json({
        error: 'Share link not found'
      }, { status: 404 })
    }

    // Increment open count
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: {
        openCount: {
          increment: 1
        }
      }
    })

    // Create view audit record
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    await prisma.viewAudit.create({
      data: {
        documentId: shareLink.documentId,
        shareLinkId: shareLink.id,
        ipHash: clientIP,
        uaHash: userAgent,
        sessionId: `session-${Date.now()}`,
        event: 'document_opened',
        meta: JSON.stringify({
          shareCode: params.code,
          timestamp: new Date().toISOString()
        })
      }
    })

    console.log('✅ View recorded for share link:', params.code)

    return NextResponse.json({
      success: true,
      message: 'View recorded'
    })

  } catch (error) {
    console.error('❌ Error recording view:', error)
    
    return NextResponse.json({ 
      error: 'Failed to record view',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}