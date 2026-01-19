import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // Expire pending consultations older than 1 hour
    const { data: expiredConsultations, error: consultError } = await supabase
      .from('consultations')
      .update({
        status: 'expired',
        auto_expired: true,
        cancel_reason: 'Otomatis dibatalkan karena tidak ada respons dalam 1 jam'
      })
      .eq('status', 'pending')
      .lt('created_at', oneHourAgo)
      .select('id, client_id, lawyer_id')

    if (consultError) {
      console.error('Error expiring consultations:', consultError)
      throw consultError
    }

    // Create alerts for expired consultations
    if (expiredConsultations && expiredConsultations.length > 0) {
      for (const consultation of expiredConsultations) {
        // Alert for client
        await supabase.from('user_activity_alerts').insert({
          user_id: consultation.client_id,
          type: 'consultation_expired',
          title: 'Konsultasi Dibatalkan Otomatis',
          message: 'Permintaan konsultasi Anda dibatalkan otomatis karena tidak ada respons dari pengacara dalam 1 jam.',
          related_id: consultation.id
        })

        // Get lawyer user_id and alert
        const { data: lawyer } = await supabase
          .from('lawyers')
          .select('user_id')
          .eq('id', consultation.lawyer_id)
          .single()

        if (lawyer) {
          await supabase.from('user_activity_alerts').insert({
            user_id: lawyer.user_id,
            type: 'consultation_expired',
            title: 'Konsultasi Dibatalkan Otomatis',
            message: 'Permintaan konsultasi telah dibatalkan otomatis karena tidak direspons dalam 1 jam.',
            related_id: consultation.id
          })
        }
      }
    }

    // Expire pending legal assistance requests older than 1 hour
    const { data: expiredAssistance, error: assistError } = await supabase
      .from('legal_assistance_requests')
      .update({
        status: 'cancelled',
        auto_expired: true,
        cancel_reason: 'Otomatis dibatalkan karena tidak ada respons dalam 1 jam'
      })
      .eq('status', 'pending')
      .lt('created_at', oneHourAgo)
      .select('id, client_id, lawyer_id')

    if (assistError) {
      console.error('Error expiring assistance requests:', assistError)
      throw assistError
    }

    // Create alerts for expired assistance requests
    if (expiredAssistance && expiredAssistance.length > 0) {
      for (const request of expiredAssistance) {
        // Alert for client
        await supabase.from('user_activity_alerts').insert({
          user_id: request.client_id,
          type: 'assistance_expired',
          title: 'Pendampingan Dibatalkan Otomatis',
          message: 'Permintaan pendampingan Anda dibatalkan otomatis karena tidak ada respons dari pengacara dalam 1 jam.',
          related_id: request.id
        })

        // Get lawyer user_id and alert
        const { data: lawyer } = await supabase
          .from('lawyers')
          .select('user_id')
          .eq('id', request.lawyer_id)
          .single()

        if (lawyer) {
          await supabase.from('user_activity_alerts').insert({
            user_id: lawyer.user_id,
            type: 'assistance_expired',
            title: 'Pendampingan Dibatalkan Otomatis',
            message: 'Permintaan pendampingan telah dibatalkan otomatis karena tidak direspons dalam 1 jam.',
            related_id: request.id
          })
        }
      }
    }

    const result = {
      success: true,
      expiredConsultations: expiredConsultations?.length || 0,
      expiredAssistance: expiredAssistance?.length || 0,
      timestamp: new Date().toISOString()
    }

    console.log('Auto-expire completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error in auto-expire function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
