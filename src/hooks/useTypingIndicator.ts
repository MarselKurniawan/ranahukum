import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface PresenceState {
  id: string;
  isTyping: boolean;
  presence_ref?: string;
}

export function useTypingIndicator(consultationId: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!consultationId || !user) return;

    const channelName = `typing-${consultationId}`;
    console.log('[TypingIndicator] Setting up channel:', channelName);
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        console.log('[TypingIndicator] Presence sync:', state);
        
        const newTypingUsers: Record<string, boolean> = {};
        Object.entries(state).forEach(([, presences]) => {
          const presence = presences[0];
          if (presence && presence.id !== user.id) {
            newTypingUsers[presence.id] = presence.isTyping ?? false;
          }
        });
        setTypingUsers(newTypingUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[TypingIndicator] User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('[TypingIndicator] User left:', leftPresences);
        setTypingUsers(prev => {
          const updated = { ...prev };
          (leftPresences as PresenceState[]).forEach(presence => {
            if (presence.id) {
              delete updated[presence.id];
            }
          });
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[TypingIndicator] Subscribed to channel');
          await channel.track({
            id: user.id,
            isTyping: false
          });
        }
      });

    return () => {
      console.log('[TypingIndicator] Cleaning up channel');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [consultationId, user]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!channelRef.current || !user) return;

    console.log('[TypingIndicator] Setting typing:', isTyping);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await channelRef.current.track({
      id: user.id,
      isTyping
    });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(async () => {
        if (channelRef.current) {
          await channelRef.current.track({
            id: user.id,
            isTyping: false
          });
        }
      }, 3000);
    }
  }, [user]);

  const isOtherUserTyping = Object.values(typingUsers).some(isTyping => isTyping);

  return {
    isOtherUserTyping,
    typingUsers,
    setTyping
  };
}
