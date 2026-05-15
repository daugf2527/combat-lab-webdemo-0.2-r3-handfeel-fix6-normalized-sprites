// tellenc.h — stub for charset detection (not needed for our JSON output)
#pragma once
#include <string>
inline std::string tellenc(const void*, size_t) { return "cp949"; }
