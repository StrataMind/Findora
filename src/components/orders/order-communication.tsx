'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import orderManager, { OrderCommunication } from '@/lib/order-management'
import {
  Send,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  File,
  Download,
  User,
  Store,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  AlertCircle,
  Star,
  ThumbsUp
} from 'lucide-react'
import { format, formatDistance } from 'date-fns'

interface OrderCommunicationProps {
  orderId: string
  currentUserId: string
  currentUserRole: 'buyer' | 'seller'
  customerInfo?: {
    name: string
    email: string
    phone?: string
  }
  sellerInfo?: {
    name: string
    email: string
    phone?: string
    rating?: number
  }
}

export default function OrderCommunicationComponent({
  orderId,
  currentUserId,
  currentUserRole,
  customerInfo,
  sellerInfo
}: OrderCommunicationProps) {
  const { data: session } = useSession()
  const [communications, setCommunications] = useState<OrderCommunication[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [showContactInfo, setShowContactInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCommunications()
  }, [orderId])

  useEffect(() => {
    scrollToBottom()
  }, [communications])

  const loadCommunications = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement actual API call to fetch communications
      // For now, generate mock communications
      const mockCommunications = generateMockCommunications()
      setCommunications(mockCommunications)
    } catch (error) {
      console.error('Failed to load communications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockCommunications = (): OrderCommunication[] => {
    return [
      {
        id: '1',
        orderId,
        from: 'system',
        fromUserId: 'system',
        fromUserName: 'Findora System',
        message: 'Your order has been confirmed and payment has been received successfully.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isRead: true
      },
      {
        id: '2',
        orderId,
        from: 'seller',
        fromUserId: 'seller123',
        fromUserName: sellerInfo?.name || 'Tech Store',
        message: 'Thank you for your order! We are preparing your items for shipment. Expected to ship within 1-2 business days.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isRead: true
      },
      {
        id: '3',
        orderId,
        from: 'buyer',
        fromUserId: 'customer123',
        fromUserName: customerInfo?.name || 'Customer',
        message: 'Hi, when will my order be shipped? I need it by Friday for an event.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isRead: true
      },
      {
        id: '4',
        orderId,
        from: 'seller',
        fromUserId: 'seller123',
        fromUserName: sellerInfo?.name || 'Tech Store',
        message: 'Your order will be shipped today via Delhivery. Tracking ID: 1234567890. You should receive it by Thursday evening.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isRead: true
      }
    ]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return

    setIsSending(true)
    try {
      const commId = await orderManager.addCommunication(orderId, {
        from: currentUserRole,
        fromUserId: currentUserId,
        fromUserName: session?.user?.name || `${currentUserRole === 'seller' ? 'Seller' : 'Customer'}`,
        message: newMessage.trim(),
        attachments: attachments.length > 0 ? attachments.map((file, index) => ({
          id: `att_${Date.now()}_${index}`,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file), // In real app, upload to storage
          fileType: file.type
        })) : undefined
      })

      // Add the message to local state for immediate UI update
      const newComm: OrderCommunication = {
        id: commId,
        orderId,
        from: currentUserRole,
        fromUserId: currentUserId,
        fromUserName: session?.user?.name || `${currentUserRole === 'seller' ? 'Seller' : 'Customer'}`,
        message: newMessage.trim(),
        timestamp: new Date(),
        isRead: false,
        attachments: attachments.length > 0 ? attachments.map((file, index) => ({
          id: `att_${Date.now()}_${index}`,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileType: file.type
        })) : undefined
      }

      setCommunications(prev => [...prev, newComm])
      setNewMessage('')
      setAttachments([])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword']
      return file.size <= maxSize && allowedTypes.some(type => file.type.startsWith(type))
    })
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 files
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMessageAlignment = (from: string) => {
    if (from === 'system') return 'center'
    if (currentUserRole === 'seller') {
      return from === 'seller' ? 'right' : 'left'
    } else {
      return from === 'buyer' ? 'right' : 'left'
    }
  }

  const getMessageBgColor = (from: string) => {
    if (from === 'system') return 'bg-yellow-50 border-yellow-200'
    if (currentUserRole === 'seller') {
      return from === 'seller' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
    } else {
      return from === 'buyer' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Order Communication</h3>
              <p className="text-sm text-gray-600">
                Chat with {currentUserRole === 'seller' ? 'customer' : 'seller'} about this order
              </p>
            </div>
          </div>
          
          <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Contact Info
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact Information</DialogTitle>
                <DialogDescription>
                  Contact details for this order
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {currentUserRole === 'seller' && customerInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{customerInfo.email}</span>
                      </div>
                      {customerInfo.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{customerInfo.phone}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {currentUserRole === 'buyer' && sellerInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        <Store className="w-4 h-4 mr-2" />
                        Seller Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{sellerInfo.name}</span>
                        {sellerInfo.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{sellerInfo.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{sellerInfo.email}</span>
                      </div>
                      {sellerInfo.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{sellerInfo.phone}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading messages...</p>
          </div>
        ) : communications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation about this order</p>
          </div>
        ) : (
          communications.map((comm) => {
            const alignment = getMessageAlignment(comm.from)
            const bgColor = getMessageBgColor(comm.from)
            
            return (
              <div
                key={comm.id}
                className={`
                  flex ${alignment === 'right' ? 'justify-end' : alignment === 'center' ? 'justify-center' : 'justify-start'}
                `}
              >
                <div className={`
                  max-w-xs lg:max-w-md px-4 py-3 rounded-lg border ${bgColor}
                  ${alignment === 'center' ? 'text-center' : ''}
                `}>
                  {comm.from !== 'system' && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                          ${comm.from === 'seller' ? 'bg-green-100 text-green-600' : comm.from === 'buyer' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                        `}>
                          {comm.from === 'seller' ? <Store className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        </div>
                        <span className="text-xs font-semibold text-gray-900">
                          {comm.from === currentUserRole ? 'You' : comm.fromUserName}
                        </span>
                      </div>
                      {!comm.isRead && comm.from !== currentUserRole && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comm.message}</p>
                  
                  {comm.attachments && comm.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {comm.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 bg-white p-2 rounded border">
                          {attachment.fileType.startsWith('image/') ? (
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                          ) : (
                            <File className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-xs font-medium flex-1 truncate">{attachment.fileName}</span>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={attachment.fileUrl} download={attachment.fileName}>
                              <Download className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{format(comm.timestamp, 'MMM dd, HH:mm')}</span>
                    {comm.from === currentUserRole && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded text-sm">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <File className="w-4 h-4 text-gray-500" />
                )}
                <span className="truncate max-w-20">{file.name}</span>
                <span className="text-gray-400">({formatFileSize(file.size)})</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <div className="flex-1">
            <Textarea
              placeholder={`Message ${currentUserRole === 'seller' ? 'customer' : 'seller'}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileAttach}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= 5}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachments.length === 0 || isSending}
              size="sm"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line. Max 5 files, 10MB each.
        </p>
      </div>
    </div>
  )
}