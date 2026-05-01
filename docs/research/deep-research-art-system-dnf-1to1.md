# DNF 式横版动作游戏美术系统的 1:1 实现研究报告

## 研究边界与核心判断

这份报告只采用公开可验证资料：韩文的一手官方演讲、英文官方站点、公开的解析器代码、以及公开社区研究。我**不使用泄露客户端、未授权素材包或规避保护措施的操作说明**；你要做 1:1，关键不在“画风像不像”，而在于把**分件资产、逐帧时序、定位点、分包加载、导出约束、透明边缘处理**这一整条链做对。公开资料已经足够把这条链还原到能指导程序开发的程度。citeturn34view0turn19view0turn31view0

最重要的结论先说：如果你把这个项目理解成“角色一张大 spritesheet，动作按固定 FPS 播”，那你做出来的不会像 DNF。公开资料显示，DNF/DFO 的视觉系统更接近**分件纸娃娃 + 逐帧位图 + 每帧定位坐标 + 动画数据驱动加载**：官方韩文演讲明确说角色衣装会拆成头、身体、脸等部分并在运行时合并，`.ani` 文件在非图像/声音数据里占了很大比例；英文官方站又说明角色 Avatar 在玩家层面就是 9 件装扮位；公开 NPK/IMG 解析器则显示单帧元数据里本来就保存了宽高、定位坐标和最大框信息。把这三类证据拼起来，运行时结构已经非常清楚。citeturn33view0turn44view0turn20view0turn26view0

同样重要的一点是：**你能 1:1 还原的是系统，不是内部未公开的 Neople PSD 规范**。也就是说，公开资料足以还原“资源怎样组织、怎样命名、怎样导出、怎样在运行时拼起来、怎样按场景分包加载”；但它**不足以合法地**给你每个职业每一帧的原始源文件、完整 PSD 图层命名手册，或当前服最新客户端的全部私有数据。因此，下面我会把“可直接落地的直接证据”和“基于直接证据得出的工程推断”分开写。citeturn34view0turn12search1turn10view0

## 公开资料里能还原出来的 DNF 美术系统骨架

官方韩文演讲给出的数据量非常关键。2014 年的 NDC Replay 演讲《던전 앤 파이터 클라이언트 로딩 속도 최적화》说明：当时 DNF 已经有 **54 万个**非图像/声音数据文件、**1000 万张以上**图片，图像数据量达到 **4GB 以上**；这些图片并不是一图一文件，而是被组织成大约 **8 万个 image pack**，再进一步打成大约 **2000 个更大的发布包**。这说明 DNF 的原始美术系统从一开始就不是“一个角色=一张整表”，而是**极高粒度的图像单元 + 大规模索引与打包层**。这也是你做 1:1 时必须采用“资源索引层 / 包层 / 运行时层”三层分离架构的直接原因。citeturn34view0turn33view0

公开 NPK 解析器把包层结构还原得很细。`NpkReader` 里写明 NPK 文件头是 ASCII `"NeoplePack_Bill\0"`，内部每个索引项至少包含：`offset`、`size`，以及一个 **256 字节**、按 key 异或后得到的 null-terminated ASCII 路径字符串；路径前缀主要是 `sprite/` 与 `sounds/` 两类。代码注释里甚至给了一个典型路径例子：`sprite/character/gunner/effect/aerialdashattack.img`。这意味着资源命名空间天然是**域 / 职业 / 模块 / 动作**式的，而不是随意命名。citeturn19view0turn21view0

IMG 层的帧元数据同样已经能还原到字段级别。公开解析器读帧时按这个顺序取字段：`pixelFormat`、`compressedField`、`width`、`height`、`compressedLength`、`keyX`、`keyY`、`maxWidth`、`maxHeight`；如果是链接帧，则只存一个 `linkFrame`。像素格式枚举值公开为 `14=1555`、`15=4444`、`16=8888`、`17=Link`；解析器把 `keyX/keyY` 映射成 `LocationX/LocationY`，并把 `maxWidth/maxHeight` 一并保留下来。解析器作者还在注释里指出：IMG 头后面有一个字段经过全量扫描后大致等于 `36 × 非链接帧数 + 8 × 链接帧数`，另一个字段通常是 `0`，再一个字段通常是 `2`。这些都是你做 1:1 数据模型时应直接保留的字段，不要在导出阶段把它们“烘焙丢掉”。citeturn19view0turn20view0turn21view0turn26view0

从“定位坐标”这个点，可以看出 DNF 运行时为什么不能简化成普通 sheet 动画。公开 `FrameInfo.GetNormalizedCoordinates` 会根据 `LocationX/LocationY + Width/Height` 算出一组帧共享的最小包围范围；`GifMaker` 在生成 GIF 时也会先把不同帧放到同一个归一化坐标系里，再做合成。韩文社区复刻日志则提到，若直接把 NPK 里的 PNG 抽出来，很多工具会丢失所谓的 “pivot / true coordinates”，他们最后只能选择导出到固定 **800×600** 画布中来保住对位关系。这里你要特别注意：**800×600 是工具补偿方案，不是你引擎里该硬编码的角色画布尺寸**；真正该保留的是每帧自己的 `keyX/keyY` 或等价锚点。citeturn26view0turn22view1turn10view0

动画数据层的证据来自官方演讲和官方头像系统说明。NDC 讲者明确说，DNF 的 `.ani` 文件本质上就是“2D 游戏里每一帧用哪张图片、按什么顺序出现”的文件，而且它占非图像/声音数据文件的很大比例；同一个角色因为衣装和部件化的原因，加载时可能创建 **2000+** 个动画对象。DFO 官方英文站又说明 Avatar 在玩家系统层是 **9 Pieces**。这两条合起来，直接指向一个实现原则：**玩家可见系统是 9 件装扮位，渲染系统必须比 9 件更细**，因为真正落到运行时时，至少要把主身体、头部、脸部、武器、影子、特效视为可独立切换的层，不能把“装备位”和“渲染层”混为一谈。citeturn33view0turn44view0

地图美术也不是单一 tileset 模型。公开提取教程明确说 `ImagePacks2` 中可以直接提取环境背景、建筑和透明底图；韩文复刻日志又提到某些房间资源更像“**整张地图 + 整个 effect 文件**”，而不是高度模块化 tileset。这意味着如果你要 1:1，地图系统必须同时支持两条美术路径：一条是**大底图分层板**，一条是**可复用块件 / 特效层**。把所有场景都强行做成纯格子 tileset，反而会偏离 DNF 的真实资源形态。citeturn31view0turn10view0

## 可以直接交给程序实现的数据模型与运行时逻辑

按上面的公开证据，最接近 DNF 的运行时不是“一个 Sprite 播一个 clip”，而是**一个角色实例持有多个部件 clip，clip 的每一帧引用 IMG 中的具体 frame，并带有自己的时序与定位信息**。你需要的不是“更大的 atlas”，而是“更严格的数据层”。Phaser 官方也明确区分了 `spritesheet` 与 `atlas`：前者是均匀格子，后者是任意尺寸任意位置的帧；而 DNF 公共帧元数据天然带有不均匀尺寸与定位坐标，因此角色主体、武器与特效应按 **atlas / multiatlas** 逻辑来做，只有伤害数字、状态图标、UI 小件等真正统一网格的资产才适合 grid sheet。citeturn37view4turn20view0turn26view0

按公开解析器与官方/社区证据，你可以把底层与运行时数据先定成下面这组结构：

```ts
type NpkIndexEntry = {
  offset: number;          // packed file absolute offset
  size: number;            // packed file byte size
  path: string;            // e.g. sprite/character/gunner/effect/aerialdashattack.img
};

type ImgFrameMeta = {
  pixelFormat: 14 | 15 | 16 | 17;  // 1555 / 4444 / 8888 / Link
  compressedFlag?: 5 | 6;          // community parser treats 5=raw, 6=compressed
  width: number;
  height: number;
  dataLength: number;              // compressedLength or raw length
  keyX: number;                    // anchor / placement coordinate
  keyY: number;                    // anchor / placement coordinate
  maxWidth: number;
  maxHeight: number;
  linkFrame?: number;              // if pixelFormat === 17
};

type AnimFrame = {
  imageFile: string;               // logical img path
  frameIndex: number;              // specific frame in img
  positionX: number;
  positionY: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  rgba: [number, number, number, number];
  interpolation: boolean;
  graphicEffect: string;
  delayMs: number;                 // per-frame timing, mandatory
};

type RenderLayer = {
  slot: string;                    // body/base, avatar_part_x, weapon, shadow, fx
  z: number;                       // strict ordered layering
  clipKey: string;                 // state/direction/variant resolved clip
};

type CharacterVisualState = {
  actorClass: string;
  direction: string;
  action: string;
  weaponType: string;
  avatarConfigId: string;
  mapLightingProfile: string;
  layers: RenderLayer[];
};
```

这组字段不是“猜的”。`offset/size/path`、NPK header、IMG header、`pixelFormat` 编号、`keyX/keyY/maxWidth/maxHeight` 都直接出自公开解析器；`delayMs`、`positionX/Y`、缩放、旋转、RGBA、插值、graphicEffect` 则对应公开动画类里已经出现的字段。唯一要诚实说明的是：后者那组动画字段来自公开库的动画模型，不是 Neople 内部正式文档，所以你应该把它当成**高度可信的运行时目标模型**，而不是“官方命名”。citeturn19view0turn20view0turn26view0turn27view0turn27view1turn26view2

程序逻辑上，我建议你按“**状态解析 → clip 解析 → bundle 解析 → 帧合成**”这四段实现。状态解析先用 `class + weaponType + action + direction + avatarConfigId` 找到 clip；clip 里的每一帧再指向具体 `imageFile + frameIndex`；加载层根据 `imageFile` 去 bundle manifest 找 atlas / multiatlas；最后用 `keyX/keyY` 和动画层的 `positionX/Y` 做最终合成。这个顺序不能反过来，否则你会在运行时不断做“先拍平再修正”的无效工作。DNF 官方演讲还特别提到某些技能会出现**延迟很久才出现的动画后半段**，以及**带随机附加特效**的技能，所以你的 clip 系统还必须支持**延迟子发射器**和**概率性附属 clip**，不能只支持一个线性时间轴。citeturn33view0turn37view2turn37view3

如果你准备用 Phaser，当心一个很常见的“像了但不对”的坑：Phaser 确实支持全局动画、Aseprite 动画以及 per-frame `duration`，但 DNF 式角色主体最好还是自己写合成层，而不是把整个人物当成一个 `Sprite.play()`。Phaser 的动画系统适合做**单层特效、UI 元素、图标闪烁、环境件**；角色主体则应该是**多个 layer sprite / render target**，每层都按帧去取 atlas frame，并共享一套主时间轴。只有这样，换时装、换武器、技能附加层、阴影层、受击色调层才会在结构上接近 DNF。citeturn37view5turn35view2turn33view0

还有一个来自韩文复刻实践、但我认为非常重要的工程结论：**不要用 enum 管 Avatar、技能、特效**。那位复刻作者回顾时最明确的踩坑就是：以 enum 驱动 Avatar/技能扩展后，每新增一件装扮或一个技能都要改枚举、改 switch、改 UI 绑定、改动画帧，扩展性极差。1:1 做 DNF，一定要走**数据驱动 ID + manifest + 装配表**，而不是写死在代码里。这个点虽然是社区经验，但和官方演讲里“数据量巨大、对象极多、长期 live 维护”的背景完全一致。citeturn10view1turn34view0turn33view0

## 资源命名、目录、源文件与导出流水线

目录层面，最接近 DNF 的做法不是“按美术软件分类”，而是“**源文件、运行时文件、manifest 完全分离；运行时目录保持 DNF 式命名空间**”。公开解析器里的路径示例是 `sprite/character/gunner/effect/aerialdashattack.img`，而 Unity 的项目组织建议强调：要文档化命名与目录结构、不要在根层乱建目录、内部资源与第三方资源分开存放、命名保持一致并避免空格。把这两条合起来，推荐你在项目里直接定这种树：citeturn21view0turn35view5

```text
/art_src
  /character
    /slayer_m
      /body
        /ase
        /psd
      /avatar
        /hair
        /face
        /torso
        /waist
        /pants
        /shoes
      /weapon
      /effect
  /map
    /seria_room
    /bilmark
  /ui
    /icon
    /hud
    /panel
  /shared
    /palette
    /frame
    /fontref

/art_build
  /atlas
    /character
    /weapon
    /effect
    /ui
  /json
    /character
    /weapon
    /effect
    /ui
  /manifest
    boot.pack.json
    ui.pack.json
    class_slayer_m.pack.json
    map_seria_room.pack.json
    dungeon_bilmark.pack.json

/runtime_meta
  visual_db.json
  clip_db.json
  avatar_db.json
  zorder_db.json
```

命名规则不要追求“简短”，而要追求**可生成、可搜索、可自动校验**。Unity 的命名建议强调语义化与一致性，TexturePacker 支持通过数值后缀自动识别动画组，Phaser 的 `generateFrameNames()` 又直接依赖 `prefix + zeroPad + suffix` 生成帧序列。所以最稳的命名模式是固定字段顺序，比如：`{class}_{action}_{dir}_{slot}_{variant}_{frame4}`。例如 `slayerm_attack01_right_body_default_0001`、`slayerm_attack01_right_weapon_katana_0001`。这样一来，TexturePacker 能自动识别数组帧名，Phaser 能直接按前缀和零填充取帧，你自己的校验脚本也能反向解析出 `class/action/dir/slot/variant` 维度。citeturn43view1turn36view2turn37view6

源文件管理要坚决执行“**可编辑源文件是唯一真相，运行时 PNG/JSON 只是导出物**”。Aseprite 官方文档明确区分了 Save 与 Export：保存 `.aseprite` 才会保留完整编辑信息，导出才是 `.png/.gif` 或 spritesheet/JSON；官方 CLI 又支持 `--sheet`、`--data`、`--split-layers`、`--list-tags`。Photoshop 官方帮助则直接支持 `Export Layers to Files`，并支持通过 Generator / Image Assets 让层名后缀 `.png/.jpg/.gif/.svg` 自动导出资产；Figma 官方则支持导出整个 `.fig` 文件，支持变量、描述和库更新说明。你应该把这三类源文件分别用于不同资产：Aseprite 负责角色/特效序列帧，PSD 负责大插画/复杂 UI 组合，Figma 负责 UI 布局、色板与设计 token。citeturn5search2turn5search6turn38view0turn38view3turn40search0turn40search1turn35view6turn35view7turn43view0

真正能把“美术系统”变成“可维护系统”的，是**标签、切片、描述、变量**这些元信息，而不是文件本身。Aseprite 的 Tags 用来定义动画段，且可写入 JSON `meta`；Slices 不仅能定义区域，还有 **pivot** 与 9-slice 信息；Figma 则允许给 styles/components/variables 写描述与外部文档链接，专门用于指导开发者正确实现。我的建议是：角色/特效在 Aseprite 里必须用 tag 命名动作；每个需要锚点的部件必须用 slice 标出基准点；UI 在 Figma 里所有颜色、间距、发光、描边统一做成 variables / styles，并把“适用场景、是否发光、是否仅用于稀有品质图标”这类规则写进 description。否则，你的项目很快会退化成“文件在，但没人知道怎么用”。citeturn38view1turn38view5turn38view6turn43view0turn35view7

## 打包、加载、透明边缘与格式选择

导出层不要把 “spritesheet” 和 “atlas” 混着用。Aseprite 官方把 sprite sheet 解释为一张大图里放多个帧；Phaser 官方则更进一步明确：`spritesheet` 是**均匀格子**，`atlas` 是**任意尺寸任意位置**。而 DNF 公开帧元数据天然就是可变宽高与定位点，所以**角色、武器、技能特效、地图件一律按 atlas / multiatlas 处理**；只有伤害数字、状态图标、Buff 小图、UI 小符号等固定网格资产，才适合真正的 grid spritesheet。若你想让 Aseprite 直接喂给 Phaser 的 `createFromAseprite()`，Phaser 官方要求 Aseprite 导出时把 Sheet type 设成 **Packed**，Constraints 设成 **None**。这条只适合简单单层动画；角色主体仍建议自定义导出 JSON。citeturn35view1turn37view4turn35view2turn20view0

TexturePacker 这类工具在你的链路里更像“运行时打包器”，不是“动画语义来源”。它的参数建议我给得很明确：**角色/武器/技能 atlas 禁用 rotation；shape padding 至少 2；border padding > 0；打开 trim sprite names；必要时 prepend folder name；超限时启用 multipack 并把 `{n}` 占位符写进文件名。**这不是保守，而是为了 1:1：官方文档明确说 rotation 只是为了更好装箱，且不是所有框架都支持；shape padding 至少 2 才能避免 OpenGL/WebGL 的邻帧污染；trim sprite names / folder name 则直接影响运行时 frame key 的可读性与唯一性。citeturn36view0turn36view1turn36view2turn36view3turn36view6

Manifest 与分包层，建议直接按 Phaser 的 Asset Pack JSON 思路做。Phaser 文档说明 Asset Pack file 本身就是 JSON manifest，而且大项目最好拆成多个 pack；官方还明确建议至少要有一个 Preloader pack，再有其他场景 pack；`load.json()` + `load.pack()` 可以按 section 动态加载，`multiatlas()` 则负责把一个逻辑资源集合映射到多张纹理。结合 DNF 官方演讲里“超大量 image pack / super pack”与“按技能、地图时机预读以减少卡顿”的思路，最接近 DNF 的方案是：`boot/ui/common_fx` 常驻，`class_common` 半常驻，`avatar_variant`、`weapon_variant`、`map`、`dungeon_fx`、`boss_fx`、`cutin`、`rare_ui` 按场景和职业懒加载。citeturn37view0turn37view1turn37view2turn37view3turn33view0

透明边缘问题要单独当成一个系统，不然你最后一定会在技能边缘、地图拼接和 UI 阴影处看到白边、黑边或串色。Unity 的边缘填充说明指出，透明“沟槽”如果和内部颜色差异大，降采样与过滤会把它们混在一起形成接缝；TexturePacker 则要求 shape/border padding；而 premultiplied alpha 的文档说明也很明确：它在图像过滤与图层合成时通常比 straight alpha 效果更好，但前提是你的贴图与 blending state 一致。换句话说，你的导出流水线必须二选一并全链路一致：**要么 straight alpha + 导出前做 RGB 外扩（alpha bleed / dilate），要么 premultiplied alpha + 运行时用对应 blend state。**最忌讳的是资源是 straight alpha，运行时却按 premultiplied 去混，或者反过来。citeturn42view4turn42view5turn42view6turn36view1

格式选择上，原则也不要模糊。web.dev 明确说明：**有尖锐边缘、线稿、文字**的图像并不适合随便上有损压缩；Figma 官方也明确说 PNG 支持无损、透明和高对比色文本，JPG 不支持透明且会影响文字可读性。对 DNF 式项目，这意味着**角色帧、技能帧、图标、UI 框、地图前景件优先 PNG 或无损 WebP**；大面积背景板、不会做像素级对位的插画层，可以考虑无损或高品质 WebP；不要把技能图标、带 alpha 的 FX、边缘很硬的 UI 边框导成 JPG。至于 GPU 压缩纹理，MDN 明确指出它们主要解决的是**显存占用**，并不直接等同于“更省网络带宽”；Phaser 也说明它支持浏览器可显示的图片，以及从 3.60 起支持 WebGL compressed textures。因此，如果你做的是浏览器版，网络层仍应优先 PNG/WebP，GPU 层的 ASTC/ETC 则作为增强路径，不应拿它们替代资源下载格式。citeturn42view0turn41view0turn42view1turn42view2turn37view4

如果你的 UI 打算走 Figma 管线，还有一个很实际的细节：Figma 允许导出选择 `sRGB` 或 `Display P3`，还能在 PNG/JPG/PDF 上选择重采样方式；其中 `Basic` 是 nearest-neighbor，`Detailed` 是 bicubic。对 DNF 式项目，这意味着你至少要在样式文档里写清：**像素感 / 硬边图标用 Basic，带柔和阴影与渐变的现代面板纹理用 Detailed；统一 color profile，不要团队里有人交 sRGB，有人交 P3。**这不是“美术偏好”，而是最后能不能保持 UI 一致性的工程约束。citeturn41view0turn43view0

## 验收标准与一条可执行的落地顺序

真正能指导开发的，不是“建议做规范”，而是“不给过的门槛”。我建议把美术资源验收分成四组硬门槛。**数据完整性门槛**：每个 clip 必须有 per-frame `delayMs`，不能默认全部固定 FPS；每帧必须有锚点/定位坐标，不能只剩宽高；所有 frame key 必须唯一、可逆解析；manifest 中每个逻辑 bundle 都必须有依赖声明和可卸载边界。少掉其中任何一项，角色切装、技能随机后效、地图切换、性能排查都会变得不可控。citeturn27view0turn37view5turn26view0turn37view0turn37view2

**画面正确性门槛**：任何透明资源都要在黑底与白底各看一遍；atlas 至少保证 shape padding 2；角色/武器/技能 atlas 默认禁 rotation；导出后检查锚点稳定性——同一动作里替换不同时装，脚底接地点、武器握把点、头脸对位点不能抖。韩文社区复刻里之所以绕回固定 800×600 true coordinates，就是因为少了这一层校验；你不需要复用他们的 800×600 方案，但必须复用他们发现的问题。citeturn36view1turn36view3turn42view4turn10view0

**性能与加载门槛**：绝对不要把角色或地图做成“一次性整包全驻留”的思路。官方韩文演讲已经把教训讲得很透了：超大量动画对象与图片文件会把加载和内存一起拖垮，所以它们后来做的是按技能与地图时机预读、把 image pack 再打包、把 2000 个发布包的位置索引集中化，来换取更少的磁盘抖动。你现在虽然不是做 Win32 老客户端，但浏览器/移动端面对的仍然是同一个问题，只是 IO 从机械硬盘变成了带宽和解码时间。citeturn34view0turn33view0

**流程可维护性门槛**：源文件和导出物必须分仓或至少分目录；Aseprite/PSD/Figma 里必须有 tags、slices、variables、descriptions 或等价元信息；新增一个 Avatar、武器包、图标集，不允许改代码里的 enum 或 switch，只允许增数据、重导出、重打包。只要你做不到这条，项目初期还像样，后期一旦职业、稀有时装、武器皮肤、活动 UI 叠上去，维护成本会迅速接近官方演讲里说的“长期 live 负债”状态。citeturn38view0turn38view1turn38view6turn43view0turn10view1

如果让我把落地顺序压缩成一条最可执行的工程路线，我会这么排：先实现**NPK/IMG 式帧数据模型**，确保每帧有 `format + width/height + keyX/keyY + maxWidth/maxHeight + delay`；再实现**分层角色合成器**，让 body / avatar / weapon / shadow / fx 按主时间轴合成；然后实现**manifest + bundle + prewarm**，按 boot/ui/class/map/skill 切包；接着做 **Aseprite/PSD/Figma → atlas/json/manifest** 的导出脚本；最后再做 QA 校验器，把命名、帧数、时延、padding、透明边缘、锚点抖动全自动检查。只要这五步按这个顺序推进，你做出来的就不是“像 DNF 的 2D 游戏”，而会在结构上真正接近 DNF。citeturn20view0turn26view0turn33view0turn37view0turn37view2turn38view3turn36view1