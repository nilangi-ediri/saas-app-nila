'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { vapi } from '@/lib/vapi.sdk';
import { cn, configureAssistant, getSubjectColor } from '@/assets/lib/utils';
import Lottie from 'lottie-react';
import soundwaves from '@/constants/soundwaves.json';
import type { LottieRefCurrentProps } from 'lottie-react';
import { addToSessionHistory } from '@/assets/lib/actions/companion.actions';

type CompanionComponentProps = {
    companionId: string;
    subject: string;
    topic: string;
    name: string;
    userName?: string;
    userImage?: string;
    style?: string;
    voice?: string;
};

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

export default function CompanionComponent({
    companionId,
    subject,
    topic,
    name,
    userName,
    userImage,
    style,
    voice,
}: CompanionComponentProps) {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const [messages, setMessages] = useState<SavedMessage[]>([]);


    useEffect(() => {
        if (lottieRef) {
            if (isSpeaking) {
                lottieRef.current?.play()
            } else {
                lottieRef.current?.stop()
            }
        }
    }, [isSpeaking, lottieRef]);



    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
            addToSessionHistory(companionId);
        }
        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript }

                setMessages((prev) => [newMessage, ...prev])
            }
            console.log(message)
        }
        const onError = (err: unknown) => console.error('Vapi error:', err);
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('error', onError);
        vapi.on('error', onError);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
        };
    }, []);

    const toggleMicrophone = () => {
        const isMuted = vapi.isMuted();
        vapi.setMuted(!isMuted);
        setIsMuted(!isMuted)
    }

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        const assistantOverrides = {
            variableValues: {
                subject, topic, style
            },
            clientMessages: ['transcript'],
            serverMessages: [],
        }


        vapi.start(configureAssistant(voice, style), assistantOverrides)
    }


    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED)
        vapi.stop()
    }

    return (
        <section className="flex flex-col h-[100vh]">
            <section className="flex gap-8 max-sm:flex-col">
                <div className="companion-section">
                    <div
                        className="companion-avatar relative"
                        style={{ backgroundColor: getSubjectColor(subject) }}
                    >
                        <div
                            className={cn(
                                'absolute transition-opacity duration-1000',
                                (callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE) && 'opacity-100',
                                callStatus === CallStatus.CONNECTING && 'opacity-100 animate-pulse',
                                callStatus === CallStatus.ACTIVE && 'opacity-0',
                            )}
                        >
                            <Image
                                src={`/icons/${subject}.svg`}
                                alt={subject}
                                width={150}
                                height={150}
                                className="max-sm:w-fit"
                            />
                        </div>
                        <div
                            className={cn(
                                'absolute transition-opacity duration-1000',
                                callStatus === CallStatus.ACTIVE ? 'opacity-100' : 'opacity-0',
                            )}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                className='companion-lottie'
                            />
                        </div>
                    </div>
                    <p className='font-bold text-2xl'>{name}</p>
                </div>
                <div className='user-section'>
                    <div className='user-avatar'>
                        <Image src={userImage ?? '/icons/user.svg'} alt={userName ?? 'User'} width={130} height={130} className="rounded-lg" />
                        <p className='font-bold text-2xl'>
                            {userName}
                        </p>
                    </div>
                    <button className='btn-mic' onClick={toggleMicrophone}>
                        <Image src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} alt='mic' width={36} height={36} />
                        <p className='max-sm:hidden'>
                            {isMuted ? 'Turn om microphone' : "Turn off microphone"}
                        </p>
                    </button>
                    <button className={cn('rounded-lg py-2 cursor-pointer transition-colors w-full text-white', callStatus === CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary', callStatus === CallStatus.CONNECTING && 'animate-pulse')} onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}>
                        {callStatus === CallStatus.ACTIVE
                            ? "End Session"
                            : callStatus === CallStatus.CONNECTING
                                ? 'Connecting'
                                : 'Start Session'}
                    </button>
                </div>
            </section>

            <section className='transcript'>
                <div className='transcript-message no-scrollbar'>
                    {messages.map((message, index) => {
                        if (message.role === 'assistant') {
                            return (
                                <p key={index} className='max-sm:text-sm'>
                                    {name
                                        .split(' ')[0]
                                        .replace('/[.,]/g', '')
                                    }: {message.content}
                                </p>
                            )
                        } else {
                            return <p key={index} className='text-primary max-sm:tex-sm'>
                                {userName} : {message.content}
                            </p>
                        }
                    })}
                </div>

                <div className='transcript-fade' />
            </section>
        </section>
    );
}
