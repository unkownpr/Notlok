import Foundation
import ScreenCaptureKit
import AVFoundation
import CoreMedia

// Global state for the capture
private var captureStream: SCStream?
private var audioBuffer: UnsafeMutablePointer<Float>?
private var bufferSize: Int = 0
private var bufferIndex: Int = 0
private let bufferLock = NSLock()

// Delegate class
class AudioCaptureDelegate: NSObject, SCStreamDelegate, SCStreamOutput {
    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio else { return }

        // Get audio buffer list
        var blockBuffer: CMBlockBuffer?
        var audioBufferList = AudioBufferList()
        var audioBufferListSize = MemoryLayout<AudioBufferList>.size

        let status = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(
            sampleBuffer,
            bufferListSizeNeededOut: nil,
            bufferListOut: &audioBufferList,
            bufferListSize: audioBufferListSize,
            blockBufferAllocator: nil,
            blockBufferMemoryAllocator: nil,
            flags: 0,
            blockBufferOut: &blockBuffer
        )

        guard status == noErr else {
            #if DEBUG
            print("⚠️ Failed to get audio buffer: \(status)")
            #endif
            return 
        }

        // Get the audio data
        let audioBuffer = audioBufferList.mBuffers
        guard let data = audioBuffer.mData else {
            #if DEBUG
            print("⚠️ No audio data in buffer")
            #endif
            return 
        }

        let floatCount = Int(audioBuffer.mDataByteSize) / MemoryLayout<Float>.size
        let floatPtr = data.assumingMemoryBound(to: Float.self)

        AudioCapture.bufferLock.lock()
        defer { AudioCapture.bufferLock.unlock() }

        guard let buffer = AudioCapture.audioBuffer else {
            #if DEBUG
            print("⚠️ AudioCapture.audioBuffer is nil")
            #endif
            return 
        }

        let startIndex = AudioCapture.bufferIndex
        for i in 0..<floatCount {
            if AudioCapture.bufferIndex < AudioCapture.bufferSize {
                buffer[AudioCapture.bufferIndex] = floatPtr[i]
                AudioCapture.bufferIndex += 1
            } else {
                #if DEBUG
                print("⚠️ Buffer overflow! Stopping at \(AudioCapture.bufferIndex)/\(AudioCapture.bufferSize)")
                #endif
                break
            }
        }
        
        #if DEBUG
        if AudioCapture.bufferIndex > startIndex {
            print("✅ System audio: added \(AudioCapture.bufferIndex - startIndex) samples (total: \(AudioCapture.bufferIndex))")
        }
        #endif
    }

    func stream(_ stream: SCStream, didStopWithError error: Error) {
        #if DEBUG
        print("Stream stopped with error: \(error.localizedDescription)")
        #endif
    }
}

// Singleton for state management
class AudioCapture {
    static var audioBuffer: UnsafeMutablePointer<Float>?
    static var bufferSize: Int = 0
    static var bufferIndex: Int = 0
    static let bufferLock = NSLock()

    static let delegate = AudioCaptureDelegate()
    static var stream: SCStream?
}

// C-compatible functions
@_cdecl("sc_audio_capture_start")
public func sc_audio_capture_start(buffer: UnsafeMutablePointer<Float>, size: Int32) -> Bool {
    AudioCapture.audioBuffer = buffer
    AudioCapture.bufferSize = Int(size)
    AudioCapture.bufferIndex = 0

    let semaphore = DispatchSemaphore(value: 0)
    var success = false

    Task {
        do {
            // Get shareable content
            let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)

            guard let display = content.displays.first else {
                #if DEBUG
                print("No display found")
                #endif
                semaphore.signal()
                return
            }

            // Create filter
            let filter = SCContentFilter(display: display, excludingWindows: [])

            // Configure stream for audio only
            let config = SCStreamConfiguration()
            config.width = 2
            config.height = 2
            config.capturesAudio = true
            config.sampleRate = 16000
            config.channelCount = 1
            config.excludesCurrentProcessAudio = true
            
            #if DEBUG
            print("📺 Display found: \(display.displayID)")
            print("🎤 Capturing system audio at 16kHz, mono")
            print("📊 Buffer size: \(size) samples")
            #endif

            // Create and start stream
            let stream = SCStream(filter: filter, configuration: config, delegate: AudioCapture.delegate)
            try stream.addStreamOutput(AudioCapture.delegate, type: .audio, sampleHandlerQueue: DispatchQueue(label: "audio.capture"))
            try await stream.startCapture()

            AudioCapture.stream = stream
            success = true
            #if DEBUG
            print("ScreenCaptureKit audio capture started")
            #endif
        } catch {
            #if DEBUG
            print("Failed to start capture: \(error.localizedDescription)")
            #endif
        }
        semaphore.signal()
    }

    semaphore.wait()
    return success
}

@_cdecl("sc_audio_capture_stop")
public func sc_audio_capture_stop() {
    guard let stream = AudioCapture.stream else { return }

    let semaphore = DispatchSemaphore(value: 0)

    Task {
        do {
            try await stream.stopCapture()
            #if DEBUG
            print("ScreenCaptureKit audio capture stopped")
            #endif
        } catch {
            #if DEBUG
            print("Failed to stop capture: \(error.localizedDescription)")
            #endif
        }
        semaphore.signal()
    }

    semaphore.wait()
    AudioCapture.stream = nil
}

@_cdecl("sc_audio_capture_get_samples")
public func sc_audio_capture_get_samples() -> Int32 {
    AudioCapture.bufferLock.lock()
    defer { AudioCapture.bufferLock.unlock() }
    return Int32(AudioCapture.bufferIndex)
}

// Permission check functions
@_cdecl("sc_check_screen_recording_permission")
public func sc_check_screen_recording_permission() -> Bool {
    if #available(macOS 11.0, *) {
        return CGPreflightScreenCaptureAccess()
    }
    return true
}

@_cdecl("sc_request_screen_recording_permission")
public func sc_request_screen_recording_permission() -> Bool {
    if #available(macOS 11.0, *) {
        return CGRequestScreenCaptureAccess()
    }
    return true
}

@_cdecl("sc_check_microphone_permission")
public func sc_check_microphone_permission() -> Int32 {
    switch AVCaptureDevice.authorizationStatus(for: .audio) {
    case .authorized:
        return 1
    case .notDetermined:
        return 0
    case .denied, .restricted:
        return -1
    @unknown default:
        return -1
    }
}

@_cdecl("sc_request_microphone_permission")
public func sc_request_microphone_permission(callback: @escaping @convention(c) (Bool) -> Void) {
    AVCaptureDevice.requestAccess(for: .audio) { granted in
        callback(granted)
    }
}
