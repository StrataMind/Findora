'use client'

import { CheckoutStep } from '@/app/checkout/page'
import { Check, Truck, CreditCard, Eye, CheckCircle } from 'lucide-react'

interface CheckoutStepsProps {
  currentStep: CheckoutStep
}

const steps = [
  { id: 'shipping', name: 'Shipping', icon: Truck },
  { id: 'payment', name: 'Payment', icon: CreditCard },
  { id: 'review', name: 'Review', icon: Eye },
  { id: 'complete', name: 'Complete', icon: CheckCircle }
]

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep)
  }

  const currentIndex = getCurrentStepIndex()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index < currentIndex
          const isCurrent = step.id === currentStep
          const isUpcoming = index > currentIndex

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                {/* Step Label */}
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`
                      text-sm font-medium transition-colors duration-200
                      ${isCompleted 
                        ? 'text-green-600' 
                        : isCurrent 
                          ? 'text-blue-600' 
                          : 'text-gray-500'
                      }
                    `}
                  >
                    {step.name}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`
                      h-0.5 transition-colors duration-200
                      ${index < currentIndex 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Step Labels */}
      <div className="mt-4 sm:hidden">
        <p className="text-center text-sm font-medium text-gray-900">
          {steps[currentIndex]?.name}
        </p>
        <p className="text-center text-xs text-gray-500">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>
    </div>
  )
}