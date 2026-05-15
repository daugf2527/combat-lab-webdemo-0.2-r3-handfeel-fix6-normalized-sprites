
#pragma once
#include <cstdint>
#include <cstring>
#include <string>

class BufferReader
{
public:
	BufferReader(const uint8_t* buffer, int32_t len) : buffer(buffer), len(len) {}
	template <typename T>
	inline T read()
	{
		T all{};
		std::memcpy(&all, buffer + offset, sizeof(T));
		offset += sizeof(T);
		return all;
	}

	inline auto readAsciiString(int32_t len) -> std::string {
		std::string str = { buffer + offset ,buffer + offset + len };
		offset += len;
		return str;
	}

	inline auto getOffset() const { return offset; }
	inline auto setOffset(int32_t off) { offset = off; }

private:
	const uint8_t* buffer;
	int32_t len;
	int32_t offset = 0;
};
