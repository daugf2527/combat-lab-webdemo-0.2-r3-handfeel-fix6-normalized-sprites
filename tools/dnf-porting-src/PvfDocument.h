
#pragma once
#include <cstdint>
#include <vector>
#include <memory>
#include <string>
#include <unordered_map>
#include <stack>
#include "PvfScript.h"

class PvfReader;

class PvfDocument : public PvfScript
{
public:

	enum AttributeType
	{
		Number,
		String,
	};

	union DNumber
	{
		int32_t intValue;
		float floatValue;
	};

	struct IAttribute {
		AttributeType type;
		virtual ~IAttribute() = default;
		virtual std::string toString() const { return ""; }
	};

	struct NumberAttribute final : public IAttribute {
		NumberAttribute() { type = Number; }
		DNumber value{};
		std::string toString() const override { return std::to_string(value.intValue); }
	};

	struct StringAttribute final : public IAttribute {
		StringAttribute() { type = String; }
		std::string value;
		std::string toString() const override { return value; }
	};

	struct Node
	{
		std::string name;
		std::vector<std::shared_ptr<IAttribute>> attribute;
		std::unordered_map<std::string, std::vector<Node>> children;

		inline auto size() const { return attribute.size(); };
		inline auto& operator[](const std::string& n) { return children[n]; };

		auto addAttribute(float t) -> void {
			auto att = std::make_shared<NumberAttribute>();
			att->value.floatValue = t;
			attribute.emplace_back(att);
		}
		auto addAttribute(int32_t t) -> void {
			auto att = std::make_shared<NumberAttribute>();
			att->value.intValue = t;
			attribute.emplace_back(att);
		}
		auto addAttribute(const std::string& t) -> void {
			auto att = std::make_shared<StringAttribute>();
			att->value = t;
			attribute.emplace_back(att);
		}

		bool hasEndTag = false;
	};

	PvfDocument(const uint8_t* buffer, int32_t len, PvfReader* reader);
	auto unpack() -> void override;

	inline auto& getRoot() { return root; }
	inline auto& operator[](const std::string& name) { return root[name]; }

private:
	auto splitNode(const std::string& name)->std::shared_ptr<IAttribute>;
	auto pop(std::stack<Node*>& stack, const std::string& name) -> void;

	const uint8_t* buffer;
	int32_t len;
	PvfReader* pvfReader = nullptr;
	Node root;
	Node* node = nullptr;
	static Node nullNode;
};
