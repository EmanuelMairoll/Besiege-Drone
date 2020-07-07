let baseSpeed = 0.22 
let balanceSpeed = 1.7
let counterrotateSpeed = 1.7

var fc = 0

while(true) {
	fc = ++fc == 20 ? 0 : fc
	
	var rotLV = baseSpeed
	var rotLH = baseSpeed
	var rotRH = baseSpeed
	var rotRV = baseSpeed

	let angleSensor = readSensor(0)
	let speedSensor = readSensor(9) 	
	
	try {
		//////////////////////////////////////////BRAKE//////////////////////////////////////////

		let vel = angleSensor.quaternion.inv().mul(speedSensor.velocity)
		
		let vx = vel.x
		let vy = vel.y
		let vz = vel.z 
				
		function brake(r) {
			return 0.00 * r
		}	
		
		let yawModifyer = brake(-vx)
		let pitchModifyer = brake(vz)
		
		//////////////////////////////////////////FBLR CONTROL//////////////////////////////////////////
		let front = in(10)
		let back = in(11)
		let left = in(12)
		let right = in(13)
		
		if (front) pitchModifyer = 0.4
						 
		//////////////////////////////////////////BALANCE//////////////////////////////////////////. 
							
		let rx = angleSensor.quaternion.x
		let ry = angleSensor.quaternion.y
		let rz = angleSensor.quaternion.z
		let rw = angleSensor.quaternion.w
				
		let yaw   = Math.asin(2*rx*ry + 2*rz*rw)
		let pitch = Math.atan2(2*rx*rw - 2*ry*rz, 1 - 2*rx*rx - 2*rz*rz)
		let roll  = Math.atan2(2*ry*rw - 2*rx*rz, 1 - 2*ry*ry - 2*rz*rz)
		
		function balance(r) {
			if (r >= 0){
				return Math.pow(r, balanceSpeed)
			} else {
				return -Math.pow(-r, balanceSpeed)
			}
		}	
		
		let dyaw = balance(yaw + yawModifyer)
		let dpitch = balance(pitch + pitchModifyer)
					
		rotLV += -dyaw + dpitch
		rotLH += -dyaw + -dpitch
		rotRH += dyaw + -dpitch
		rotRV += dyaw + dpitch
	
		//////////////////////////////////////////COUNTERROTATE//////////////////////////////////////////
	
		let rvx = angleSensor.velocity.x
		let rvy = angleSensor.velocity.y
		let rvz = angleSensor.velocity.z
		
		function counterrotate(r) {
			if (r >= 0){
				return Math.pow(r, counterrotateSpeed)
			} else {
				return -Math.pow(-r, counterrotateSpeed)
			}
		}
		
		let dry = counterrotate(rvy)
		
		rotLV += dry
		rotLH += -dry
		rotRH += dry
		rotRV += -dry
	} catch (error) { 
		print(error)
	}
	
	out(1, rotLV)
	out(2, rotLH)
	out(3, rotRH)
	out(4, rotRV)	
	
	out(5, -rotLV)
	out(6, -rotLH)
	out(7, -rotRH)
	out(8, -rotRV)
	
	asleep()
}

