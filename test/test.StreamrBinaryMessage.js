const assert = require('assert')
const sinon = require('sinon')
const BufferMaker = require('buffermaker')
const StreamrBinaryMessage = require('../lib/protocol/StreamrBinaryMessage')

// For sinon sandboxing in newer sinon versions
sinon.test = require('sinon-test').configureTest(sinon);

describe('StreamrBinaryMessage', function () {

	var version
	var streamId = "streamId"
	var streamPartition = 0
	var msg = {foo: "bar"}
	var timestamp = Date.now()
	var ttl = 100

	describe('version 28', function() {

		var bytes

		beforeEach(function() {
			version = 28
			bytes = new StreamrBinaryMessage(streamId, streamPartition, timestamp, ttl, StreamrBinaryMessage.CONTENT_TYPE_JSON, new Buffer(JSON.stringify(msg), 'utf8')).toBytes()
		})

		describe('toBytes/fromBytes', function() {

			it('must not alter the field content', function() {
				var m = StreamrBinaryMessage.fromBytes(bytes)

				assert.equal(m.version, version)
				assert.equal(m.streamId, streamId)
				assert.equal(m.streamPartition, streamPartition)
				assert.equal(m.timestamp, timestamp)
				assert.equal(m.ttl, ttl)
				assert.equal(m.contentType, StreamrBinaryMessage.CONTENT_TYPE_JSON)
				assert.deepEqual(m.getContentParsed(), msg)
			})

			it('must not parse the content with contentAsBuffer=true', function() {
				// sinon sandbox removes spies automatically
				sinon.test(function() {
					this.spy(JSON, "parse")
					this.spy(JSON, "stringify")

					var m = StreamrBinaryMessage.fromBytes(bytes, true)

					assert.equal(m.version, version)
					assert.equal(m.streamId, streamId)
					assert.equal(m.streamPartition, streamPartition)
					assert.equal(m.timestamp, timestamp)
					assert.equal(m.ttl, ttl)
					assert.equal(m.contentType, StreamrBinaryMessage.CONTENT_TYPE_JSON)
					assert(Buffer.isBuffer(m.content))

					// Since the content was passed as a buffer, it should remain as is on toBytes()
					m.toBytes()
					assert.equal(JSON.parse.callCount, 0)
					assert.equal(JSON.parse.callCount, 0)
				})
			})

			it('must fail if content is not a buffer', function() {
				assert.throws(() => {
					new StreamrBinaryMessage(streamId, streamPartition, timestamp, ttl, StreamrBinaryMessage.CONTENT_TYPE_JSON, "I AM NOT A BUFFER")
				})
			})

		})

	})

});
