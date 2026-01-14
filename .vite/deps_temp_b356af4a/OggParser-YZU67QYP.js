import {
  VorbisParser
} from "./chunk-ZXFPGLK4.js";
import {
  FourCcToken
} from "./chunk-MDQFXW3K.js";
import {
  EndOfStreamError
} from "./chunk-HGLV352Y.js";
import "./chunk-7PYRBTFS.js";
import {
  getBit,
  trimRightNull
} from "./chunk-5FWD7KQG.js";
import {
  BasicParser,
  INT32_LE,
  StringType,
  UINT16_BE,
  UINT16_LE,
  UINT24_BE,
  UINT32_LE,
  UINT64_LE,
  UINT8,
  Uint8ArrayType,
  makeUnexpectedFileContentError,
  require_browser
} from "./chunk-MLDZSLDQ.js";
import {
  __toESM
} from "./chunk-KXSF5BLP.js";

// node_modules/music-metadata/lib/ogg/OggParser.js
var import_debug3 = __toESM(require_browser(), 1);

// node_modules/music-metadata/lib/ogg/opus/Opus.js
var OpusContentError = class extends makeUnexpectedFileContentError("Opus") {
};
var IdHeader = class {
  constructor(len) {
    this.len = len;
    if (len < 19) {
      throw new OpusContentError("ID-header-page 0 should be at least 19 bytes long");
    }
  }
  get(buf, off) {
    return {
      magicSignature: new StringType(8, "ascii").get(buf, off + 0),
      version: UINT8.get(buf, off + 8),
      channelCount: UINT8.get(buf, off + 9),
      preSkip: UINT16_LE.get(buf, off + 10),
      inputSampleRate: UINT32_LE.get(buf, off + 12),
      outputGain: UINT16_LE.get(buf, off + 16),
      channelMapping: UINT8.get(buf, off + 18)
    };
  }
};

// node_modules/music-metadata/lib/ogg/opus/OpusParser.js
var OpusParser = class extends VorbisParser {
  constructor(metadata, options, tokenizer) {
    super(metadata, options);
    this.tokenizer = tokenizer;
    this.idHeader = null;
    this.lastPos = -1;
  }
  /**
   * Parse first Opus Ogg page
   * @param {IPageHeader} header
   * @param {Uint8Array} pageData
   */
  parseFirstPage(header, pageData) {
    this.metadata.setFormat("codec", "Opus");
    this.idHeader = new IdHeader(pageData.length).get(pageData, 0);
    if (this.idHeader.magicSignature !== "OpusHead")
      throw new OpusContentError("Illegal ogg/Opus magic-signature");
    this.metadata.setFormat("sampleRate", this.idHeader.inputSampleRate);
    this.metadata.setFormat("numberOfChannels", this.idHeader.channelCount);
  }
  async parseFullPage(pageData) {
    const magicSignature = new StringType(8, "ascii").get(pageData, 0);
    switch (magicSignature) {
      case "OpusTags":
        await this.parseUserCommentList(pageData, 8);
        this.lastPos = this.tokenizer.position - pageData.length;
        break;
      default:
        break;
    }
  }
  calculateDuration(header) {
    if (this.metadata.format.sampleRate && header.absoluteGranulePosition >= 0) {
      const pos_48bit = header.absoluteGranulePosition - this.idHeader.preSkip;
      this.metadata.setFormat("numberOfSamples", pos_48bit);
      this.metadata.setFormat("duration", pos_48bit / 48e3);
      if (this.lastPos !== -1 && this.tokenizer.fileInfo.size && this.metadata.format.duration) {
        const dataSize = this.tokenizer.fileInfo.size - this.lastPos;
        this.metadata.setFormat("bitrate", 8 * dataSize / this.metadata.format.duration);
      }
    }
  }
};

// node_modules/music-metadata/lib/ogg/speex/SpeexParser.js
var import_debug = __toESM(require_browser(), 1);

// node_modules/music-metadata/lib/ogg/speex/Speex.js
var Header = {
  len: 80,
  get: (buf, off) => {
    return {
      speex: new StringType(8, "ascii").get(buf, off + 0),
      version: trimRightNull(new StringType(20, "ascii").get(buf, off + 8)),
      version_id: INT32_LE.get(buf, off + 28),
      header_size: INT32_LE.get(buf, off + 32),
      rate: INT32_LE.get(buf, off + 36),
      mode: INT32_LE.get(buf, off + 40),
      mode_bitstream_version: INT32_LE.get(buf, off + 44),
      nb_channels: INT32_LE.get(buf, off + 48),
      bitrate: INT32_LE.get(buf, off + 52),
      frame_size: INT32_LE.get(buf, off + 56),
      vbr: INT32_LE.get(buf, off + 60),
      frames_per_packet: INT32_LE.get(buf, off + 64),
      extra_headers: INT32_LE.get(buf, off + 68),
      reserved1: INT32_LE.get(buf, off + 72),
      reserved2: INT32_LE.get(buf, off + 76)
    };
  }
};

// node_modules/music-metadata/lib/ogg/speex/SpeexParser.js
var debug = (0, import_debug.default)("music-metadata:parser:ogg:speex");
var SpeexParser = class extends VorbisParser {
  constructor(metadata, options, tokenizer) {
    super(metadata, options);
    this.tokenizer = tokenizer;
  }
  /**
   * Parse first Speex Ogg page
   * @param {IPageHeader} header
   * @param {Uint8Array} pageData
   */
  parseFirstPage(header, pageData) {
    debug("First Ogg/Speex page");
    const speexHeader = Header.get(pageData, 0);
    this.metadata.setFormat("codec", `Speex ${speexHeader.version}`);
    this.metadata.setFormat("numberOfChannels", speexHeader.nb_channels);
    this.metadata.setFormat("sampleRate", speexHeader.rate);
    if (speexHeader.bitrate !== -1) {
      this.metadata.setFormat("bitrate", speexHeader.bitrate);
    }
  }
};

// node_modules/music-metadata/lib/ogg/theora/TheoraParser.js
var import_debug2 = __toESM(require_browser(), 1);

// node_modules/music-metadata/lib/ogg/theora/Theora.js
var IdentificationHeader = {
  len: 42,
  get: (buf, off) => {
    return {
      id: new StringType(7, "ascii").get(buf, off),
      vmaj: UINT8.get(buf, off + 7),
      vmin: UINT8.get(buf, off + 8),
      vrev: UINT8.get(buf, off + 9),
      vmbw: UINT16_BE.get(buf, off + 10),
      vmbh: UINT16_BE.get(buf, off + 17),
      nombr: UINT24_BE.get(buf, off + 37),
      nqual: UINT8.get(buf, off + 40)
    };
  }
};

// node_modules/music-metadata/lib/ogg/theora/TheoraParser.js
var debug2 = (0, import_debug2.default)("music-metadata:parser:ogg:theora");
var TheoraParser = class {
  constructor(metadata, options, tokenizer) {
    this.metadata = metadata;
    this.tokenizer = tokenizer;
  }
  /**
   * Vorbis 1 parser
   * @param header Ogg Page Header
   * @param pageData Page data
   */
  async parsePage(header, pageData) {
    if (header.headerType.firstPage) {
      await this.parseFirstPage(header, pageData);
    }
  }
  async flush() {
    debug2("flush");
  }
  calculateDuration(header) {
    debug2("duration calculation not implemented");
  }
  /**
   * Parse first Theora Ogg page. the initial identification header packet
   * @param {IPageHeader} header
   * @param {Buffer} pageData
   */
  async parseFirstPage(header, pageData) {
    debug2("First Ogg/Theora page");
    this.metadata.setFormat("codec", "Theora");
    const idHeader = IdentificationHeader.get(pageData, 0);
    this.metadata.setFormat("bitrate", idHeader.nombr);
  }
};

// node_modules/music-metadata/lib/ogg/OggParser.js
var OggContentError = class extends makeUnexpectedFileContentError("Ogg") {
};
var debug3 = (0, import_debug3.default)("music-metadata:parser:ogg");
var SegmentTable = class _SegmentTable {
  static sum(buf, off, len) {
    const dv = new DataView(buf.buffer, 0);
    let s = 0;
    for (let i = off; i < off + len; ++i) {
      s += dv.getUint8(i);
    }
    return s;
  }
  constructor(header) {
    this.len = header.page_segments;
  }
  get(buf, off) {
    return {
      totalPageSize: _SegmentTable.sum(buf, off, this.len)
    };
  }
};
var OggParser = class _OggParser extends BasicParser {
  constructor() {
    super(...arguments);
    this.header = null;
    this.pageNumber = 0;
    this.pageConsumer = null;
  }
  /**
   * Parse page
   * @returns {Promise<void>}
   */
  async parse() {
    debug3("pos=%s, parsePage()", this.tokenizer.position);
    try {
      let header;
      do {
        header = await this.tokenizer.readToken(_OggParser.Header);
        if (header.capturePattern !== "OggS")
          throw new OggContentError("Invalid Ogg capture pattern");
        this.metadata.setFormat("container", "Ogg");
        this.header = header;
        this.pageNumber = header.pageSequenceNo;
        debug3("page#=%s, Ogg.id=%s", header.pageSequenceNo, header.capturePattern);
        const segmentTable = await this.tokenizer.readToken(new SegmentTable(header));
        debug3("totalPageSize=%s", segmentTable.totalPageSize);
        const pageData = await this.tokenizer.readToken(new Uint8ArrayType(segmentTable.totalPageSize));
        debug3("firstPage=%s, lastPage=%s, continued=%s", header.headerType.firstPage, header.headerType.lastPage, header.headerType.continued);
        if (header.headerType.firstPage) {
          const id = new TextDecoder("ascii").decode(pageData.subarray(0, 7));
          switch (id) {
            case "vorbis":
              debug3("Set page consumer to Ogg/Vorbis");
              this.pageConsumer = new VorbisParser(this.metadata, this.options);
              break;
            case "OpusHea":
              debug3("Set page consumer to Ogg/Opus");
              this.pageConsumer = new OpusParser(this.metadata, this.options, this.tokenizer);
              break;
            case "Speex  ":
              debug3("Set page consumer to Ogg/Speex");
              this.pageConsumer = new SpeexParser(this.metadata, this.options, this.tokenizer);
              break;
            case "fishead":
            case "\0theora":
              debug3("Set page consumer to Ogg/Theora");
              this.pageConsumer = new TheoraParser(this.metadata, this.options, this.tokenizer);
              break;
            default:
              throw new OggContentError(`gg audio-codec not recognized (id=${id})`);
          }
        }
        await this.pageConsumer.parsePage(header, pageData);
      } while (!header.headerType.lastPage);
    } catch (err) {
      if (err instanceof Error) {
        if (err instanceof EndOfStreamError) {
          this.metadata.addWarning("Last OGG-page is not marked with last-page flag");
          debug3("End-of-stream");
          this.metadata.addWarning("Last OGG-page is not marked with last-page flag");
          if (this.header) {
            this.pageConsumer.calculateDuration(this.header);
          }
        } else if (err.message.startsWith("FourCC")) {
          if (this.pageNumber > 0) {
            this.metadata.addWarning("Invalid FourCC ID, maybe last OGG-page is not marked with last-page flag");
            await this.pageConsumer.flush();
          }
        }
      } else
        throw err;
    }
  }
};
OggParser.Header = {
  len: 27,
  get: (buf, off) => {
    return {
      capturePattern: FourCcToken.get(buf, off),
      version: UINT8.get(buf, off + 4),
      headerType: {
        continued: getBit(buf, off + 5, 0),
        firstPage: getBit(buf, off + 5, 1),
        lastPage: getBit(buf, off + 5, 2)
      },
      // packet_flag: Token.UINT8.get(buf, off + 5),
      absoluteGranulePosition: Number(UINT64_LE.get(buf, off + 6)),
      streamSerialNumber: UINT32_LE.get(buf, off + 14),
      pageSequenceNo: UINT32_LE.get(buf, off + 18),
      pageChecksum: UINT32_LE.get(buf, off + 22),
      page_segments: UINT8.get(buf, off + 26)
    };
  }
};
export {
  OggContentError,
  OggParser,
  SegmentTable
};
//# sourceMappingURL=OggParser-YZU67QYP.js.map
