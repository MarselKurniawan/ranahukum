import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSendMessage } from "./useMessages";
import { toast } from "sonner";

interface UseChatUploadOptions {
  consultationId: string;
}

export function useChatUpload({ consultationId }: UseChatUploadOptions) {
  const { user } = useAuth();
  const sendMessage = useSendMessage();
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const uploadFile = useCallback(async (file: File) => {
    if (!user) {
      toast.error("Anda harus login untuk mengirim file");
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${consultationId}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Gagal mengupload file");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, consultationId]);

  const sendFileMessage = useCallback(async (file: File) => {
    const fileUrl = await uploadFile(file);
    if (!fileUrl) return;

    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    
    let messageType: 'file' | 'voice' = 'file';
    if (isAudio) {
      messageType = 'voice';
    }

    await sendMessage.mutateAsync({
      consultationId,
      content: isImage ? '📷 Gambar' : isAudio ? '🎤 Voice Note' : `📎 ${file.name}`,
      messageType,
      fileUrl
    });

    toast.success("File berhasil dikirim");
  }, [uploadFile, sendMessage, consultationId]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        await sendFileMessage(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Merekam...");
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("Tidak dapat mengakses mikrofon");
    }
  }, [sendFileMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isUploading,
    isRecording,
    sendFileMessage,
    toggleRecording,
    uploadFile
  };
}
