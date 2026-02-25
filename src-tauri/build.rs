fn main() {
    // Compile Swift code for macOS system audio capture
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        use std::path::Path;

        let swift_file = "swift/AudioCapture.swift";
        let out_dir = std::env::var("OUT_DIR").unwrap();
        let lib_path = format!("{}/libaudiocapture.a", out_dir);

        if Path::new(swift_file).exists() {
            println!("cargo:rerun-if-changed={}", swift_file);

            // Compile Swift to object file
            let obj_path = format!("{}/AudioCapture.o", out_dir);
            let status = Command::new("swiftc")
                .args(&[
                    "-c",
                    "-parse-as-library",
                    "-O",
                    "-whole-module-optimization",
                    swift_file,
                    "-o", &obj_path,
                ])
                .status()
                .expect("Failed to run swiftc");

            if !status.success() {
                panic!("Swift compilation failed");
            }

            // Create static library
            let status = Command::new("ar")
                .args(&["rcs", &lib_path, &obj_path])
                .status()
                .expect("Failed to run ar");

            if !status.success() {
                panic!("Failed to create static library");
            }

            // Link the library
            println!("cargo:rustc-link-search=native={}", out_dir);
            println!("cargo:rustc-link-lib=static=audiocapture");

            // Link Swift runtime
            let _swift_lib_path = String::from_utf8(
                Command::new("xcrun")
                    .args(&["--show-sdk-path"])
                    .output()
                    .expect("Failed to get SDK path")
                    .stdout
            ).unwrap().trim().to_string();

            // Link required frameworks
            println!("cargo:rustc-link-lib=framework=ScreenCaptureKit");
            println!("cargo:rustc-link-lib=framework=CoreMedia");
            println!("cargo:rustc-link-lib=framework=AVFoundation");
            println!("cargo:rustc-link-lib=framework=Foundation");
            println!("cargo:rustc-link-lib=framework=CoreGraphics");
            println!("cargo:rustc-link-lib=framework=CoreAudio");

            // Link Swift standard library and runtime
            let toolchain_path = String::from_utf8(
                Command::new("xcrun")
                    .args(&["--toolchain", "default", "--find", "swift"])
                    .output()
                    .expect("Failed to find swift")
                    .stdout
            ).unwrap().trim().to_string();

            if let Some(lib_dir) = Path::new(&toolchain_path).parent().and_then(|p| p.parent()) {
                let swift_lib = lib_dir.join("lib/swift/macosx");
                if swift_lib.exists() {
                    println!("cargo:rustc-link-search=native={}", swift_lib.display());
                    println!("cargo:rustc-link-lib=dylib=swiftCore");
                    println!("cargo:rustc-link-lib=dylib=swift_Concurrency");
                    println!("cargo:rustc-link-lib=dylib=swiftFoundation");
                    println!("cargo:rustc-link-lib=dylib=swiftDispatch");
                }
            }

            // Also add Xcode's Swift library path
            let xcode_swift_lib = "/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/macosx";
            if Path::new(xcode_swift_lib).exists() {
                println!("cargo:rustc-link-search=native={}", xcode_swift_lib);
            }

            // Add rpath for Swift libraries
            println!("cargo:rustc-link-arg=-Wl,-rpath,/usr/lib/swift");
            println!("cargo:rustc-link-arg=-Wl,-rpath,{}", xcode_swift_lib);
        }
    }

    tauri_build::build()
}
