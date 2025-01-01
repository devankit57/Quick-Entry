'use client'
import React, { useState } from 'react'
import { QrCode, ArrowRight } from 'lucide-react'
import Tesseract from 'tesseract.js'
import axios from 'axios'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('')
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  const handleScan = () => {
    setError('')
    setVerificationStatus('')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Opens the camera on mobile devices
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement | null
      const file = target?.files?.[0]
      if (file) {
        setLoading(true)
        try {
          const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            logger: (m) => console.log(m),
          })
          const extractedNumber = extractRegistrationNumber(text)
          setRegistrationNumber(extractedNumber || 'Not Found')
        } catch (err) {
          console.error(err)
          setError('Failed to extract registration number.')
        } finally {
          setLoading(false)
        }
      }
    }
    input.click()
  }

  const extractRegistrationNumber = (text: string) => {
    // Regex to match alphanumeric registration numbers (e.g., 22MIM10077)
    const regex = /\b[A-Z0-9]{10,}\b/i
    const match = text.match(regex)
    return match ? match[0] : null
  }

  const verifyRegistration = async () => {
    if (!registrationNumber || registrationNumber === 'Not Found') {
      setError('Please scan and extract a valid registration number first.')
      return
    }

    setError('')
    setVerificationStatus('Verifying...')
    try {
      const response = await axios.post('/api/registration/verify', { registrationNumber })

      if (response.data.exists) {
        setVerificationStatus('Registration number is valid and attendance marked as present!')
        setModalMessage('Registration number is valid and attendance marked as present!')
      } else {
        setVerificationStatus('Registration number not found or inactive.')
        setModalMessage('Registration number not found or inactive.')
      }
      setIsModalOpen(true)
    } catch (err) {
      console.error(err)
      setError('Failed to verify registration number.')
      setModalMessage('Failed to verify registration number.')
      setIsModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo */}
          <div className="text-4xl font-extrabold text-white text-center">
            Quick<span className="text-yellow-400">Entry</span>
          </div>

          {/* Decorative element */}
          <div className="w-16 h-1 bg-yellow-400 rounded-full"></div>

          {/* Tagline */}
          <p className="text-white text-center text-lg">
            Seamless Access, Instant Entry
          </p>

          {/* Scan button */}
          <button
            onClick={handleScan}
            className="bg-white text-purple-600 font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center space-x-2"
            disabled={loading}
          >
            <QrCode className="w-6 h-6" />
            <span>{loading ? 'Processing...' : 'Scan Now'}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>

          {/* Verify button */}
          <button
            onClick={verifyRegistration}
            className="bg-yellow-400 text-purple-600 font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 mt-4 flex items-center space-x-2"
          >
            <span>Verify</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Display extracted registration number */}
          {registrationNumber && (
            <div className="text-white text-center mt-4">
              <h3 className="font-bold">Extracted Registration Number:</h3>
              <p>{registrationNumber}</p>
            </div>
          )}

          {/* Display verification status */}
          {verificationStatus && (
            <div className="text-green-500 text-center mt-4">
              <p>{verificationStatus}</p>
            </div>
          )}

          {/* Display error message */}
          {error && (
            <div className="text-red-500 text-center mt-4">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full">
            <p>{modalMessage}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-yellow-400 text-purple-600 py-2 px-4 rounded"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
