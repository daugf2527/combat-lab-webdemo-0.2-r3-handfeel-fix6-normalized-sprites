cmake_minimum_required(VERSION 3.10)
project(dnf-extract)

set(CMAKE_CXX_STANDARD 17)

file(GLOB SRC *.cpp *.h)

add_executable(dnf-extract ${SRC})

# Platform-specific dependencies
if(WIN32)
    # MinGW sysroot
    set(MINGW_SYSROOT "C:/ProgramData/mingw64/mingw64/x86_64-w64-mingw32")
    if(EXISTS ${MINGW_SYSROOT})
        target_include_directories(dnf-extract PRIVATE ${MINGW_SYSROOT}/include)
        target_link_directories(dnf-extract PRIVATE ${MINGW_SYSROOT}/lib)
    endif()
    target_link_libraries(dnf-extract z iconv)
else()
    # Linux: zlib via find_package, iconv is in glibc
    find_package(ZLIB REQUIRED)
    target_link_libraries(dnf-extract ZLIB::ZLIB)
endif()

target_include_directories(dnf-extract PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
