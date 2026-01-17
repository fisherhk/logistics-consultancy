'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Forwarder, Country, CargoType } from '@/types/database'

export default function NewRequestPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forwarders, setForwarders] = useState<Forwarder[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([])

  // Form state
  const [formData, setFormData] = useState({
    reference: '',
    origin_country: '',
    origin_city: '',
    dest_country: '',
    dest_city: '',
    cargo_type: '',
    weight_kg: '',
    volume_cbm: '',
    pieces: '',
    value_usd: '',
    cargo_ready_date: '',
    delivery_required_date: '',
    mode_preference: 'any' as 'air' | 'sea' | 'any',
    special_instructions: '',
    forwarder_ids: [] as string[],
  })

  useEffect(() => {
    async function loadData() {
      const [forwardersRes, countriesRes, cargoTypesRes] = await Promise.all([
        supabase.from('forwarders').select('*').order('name'),
        supabase.from('countries').select('*').order('name'),
        supabase.from('cargo_types').select('*').order('name'),
      ])

      if (forwardersRes.data) setForwarders(forwardersRes.data)
      if (countriesRes.data) setCountries(countriesRes.data)
      if (cargoTypesRes.data) setCargoTypes(cargoTypesRes.data)
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weight_kg: parseFloat(formData.weight_kg) || 0,
          volume_cbm: parseFloat(formData.volume_cbm) || 0,
          pieces: parseInt(formData.pieces) || undefined,
          value_usd: parseFloat(formData.value_usd) || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create request')
      }

      const { request } = await response.json()
      router.push(`/requests/${request.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleForwarder = (id: string) => {
    setFormData(prev => ({
      ...prev,
      forwarder_ids: prev.forwarder_ids.includes(id)
        ? prev.forwarder_ids.filter(f => f !== id)
        : [...prev.forwarder_ids, id],
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Shipment Request</h1>
        <p className="text-gray-600">Submit details to get quotes from your designated forwarders</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Shipment Details */}
        <Section title="Shipment Details">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Reference Number"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="e.g., PO-2024-001"
            />
            <Select
              label="Cargo Type"
              value={formData.cargo_type}
              onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
              required
            >
              <option value="">Select type...</option>
              {cargoTypes.map(ct => (
                <option key={ct.code} value={ct.code}>{ct.name}</option>
              ))}
            </Select>
          </div>
        </Section>

        {/* Origin & Destination */}
        <Section title="Origin & Destination">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <span>📍</span> Origin
              </h4>
              <Select
                label="Country"
                value={formData.origin_country}
                onChange={(e) => setFormData({ ...formData, origin_country: e.target.value })}
                required
              >
                <option value="">Select country...</option>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
              <Input
                label="City"
                value={formData.origin_city}
                onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                placeholder="e.g., Shanghai"
                required
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <span>🎯</span> Destination
              </h4>
              <Select
                label="Country"
                value={formData.dest_country}
                onChange={(e) => setFormData({ ...formData, dest_country: e.target.value })}
                required
              >
                <option value="">Select country...</option>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
              <Input
                label="City"
                value={formData.dest_city}
                onChange={(e) => setFormData({ ...formData, dest_city: e.target.value })}
                placeholder="e.g., Los Angeles"
                required
              />
            </div>
          </div>
        </Section>

        {/* Cargo Specifications */}
        <Section title="Cargo Specifications">
          <div className="grid grid-cols-4 gap-4">
            <Input
              label="Total Weight (kg)"
              type="number"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              placeholder="0"
              required
            />
            <Input
              label="Total Volume (CBM)"
              type="number"
              step="0.001"
              value={formData.volume_cbm}
              onChange={(e) => setFormData({ ...formData, volume_cbm: e.target.value })}
              placeholder="0"
              required
            />
            <Input
              label="Pieces/Cartons"
              type="number"
              value={formData.pieces}
              onChange={(e) => setFormData({ ...formData, pieces: e.target.value })}
              placeholder="0"
            />
            <Input
              label="Cargo Value (USD)"
              type="number"
              value={formData.value_usd}
              onChange={(e) => setFormData({ ...formData, value_usd: e.target.value })}
              placeholder="0"
            />
          </div>
        </Section>

        {/* Requirements */}
        <Section title="Requirements">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Cargo Ready Date"
              type="date"
              value={formData.cargo_ready_date}
              onChange={(e) => setFormData({ ...formData, cargo_ready_date: e.target.value })}
              required
            />
            <Input
              label="Required Delivery Date"
              type="date"
              value={formData.delivery_required_date}
              onChange={(e) => setFormData({ ...formData, delivery_required_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode Preference</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'any', icon: '🔄', label: 'Quote Both', desc: 'Compare air & sea options' },
                { value: 'air', icon: '✈️', label: 'Air Only', desc: 'Fastest transit time' },
                { value: 'sea', icon: '🚢', label: 'Sea Only', desc: 'Most economical' },
              ].map((mode) => (
                <label
                  key={mode.value}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.mode_preference === mode.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode_preference"
                    value={mode.value}
                    checked={formData.mode_preference === mode.value}
                    onChange={(e) => setFormData({ ...formData, mode_preference: e.target.value as any })}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{mode.icon}</span>
                  <span className="font-medium text-gray-900">{mode.label}</span>
                  <span className="text-xs text-gray-500">{mode.desc}</span>
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Forwarders */}
        <Section title="Select Forwarders">
          <p className="text-sm text-gray-500 mb-4">
            Choose which forwarders to request quotes from
          </p>
          <div className="grid grid-cols-4 gap-3">
            {forwarders.map((f) => (
              <label
                key={f.id}
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.forwarder_ids.includes(f.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.forwarder_ids.includes(f.id)}
                  onChange={() => toggleForwarder(f.id)}
                  className="sr-only"
                />
                <div className="w-10 h-10 bg-slate-800 text-white rounded-lg flex items-center justify-center text-xs font-bold mb-2">
                  {f.short_code}
                </div>
                <span className="text-xs text-gray-600 text-center">{f.name}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Notes */}
        <Section title="Additional Notes">
          <textarea
            value={formData.special_instructions}
            onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Any special requirements or instructions..."
          />
        </Section>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || formData.forwarder_ids.length === 0}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  )
}

function Select({
  label,
  children,
  ...props
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {children}
      </select>
    </div>
  )
}
