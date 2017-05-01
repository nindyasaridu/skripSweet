# Create a new simulator object
set ns [new Simulator]

# Enable the nam trace
$ns trace-all [open vegas_all.tr w]
$ns namtrace-all [open vegas_all.nam w]

set f0 [open out0.tr w]

set winfile [open SFQ_winfile w]

$ns color 1 Orange
$ns color 2 Red

# Create the following procedure which launches nam
proc finish {} {
      global ns f0
      close $f0
      $ns flush-trace
      puts "filtering..."
      puts "running nam..."
      exec xgraph out0.tr -geometry 800x400 &
      exec nam -a vegas_all.nam &
      exit 0
}

proc record {} {
    global sink f0
    #Get an instance of the simulator
    set ns [Simulator instance]
    #Set the time after which the procedure should be called again
    set time 0.5
    #How many bytes have been received by the traffic sinks?
    set bw0 [$sink set bytes_]
    #Get the current time
    set now [$ns now]
    #Calculate the bandwidth (in MBit/s) and write it to the files
    puts $f0 "$now [expr $bw0/$time*8/1000000]"
    #Reset the bytes_ values on the traffic sinks
    $sink set bytes_ 0
    #Re-schedule the procedure
    $ns at [expr $now+$time] "record"
}

# Creates four nodes n0, n1, n2, n3
set n0 [$ns node]
set n1 [$ns node]
set n2 [$ns node]
set n3 [$ns node]

# Create the following topology, where
# n0 and n1 are connected by a duplex-link with
# capacity 5Mbps, propagation delay 20ms, dropping
# discipline "DropTail".
$ns duplex-link $n0 $n1 5Mb 20ms DropTail

# n1 and n2 are connected by a duplex-link with
# capacity 0.5Mbps, propagation delay 100ms, and
# dropping discipline "DropTail".
$ns duplex-link $n1 $n2 0.5Mb 100ms DropTail

# n2 and n3 connected by a duplex-link with capacity 5Mbps,
# propagation delay 20ms, dropping discipline "DropTail".
$ns duplex-link $n2 $n3 5Mb 20ms DropTail

# Create a bottleneck between n1 and n2, with a maximum queue
# size of 5 packets
$ns queue-limit $n1 $n2 5

# Instruct nam how  to display the nodes
$ns duplex-link-op  $n0 $n1 orient right
$ns duplex-link-op  $n1 $n2 orient right
$ns duplex-link-op  $n2 $n3 orient right
$ns duplex-link-op  $n1 $n2 queuePos 0.5

# Establish a TCP (Reno) connection between n0 and n3
set tcp [new Agent/TCP/Vegas]
$ns attach-agent $n0 $tcp
set sink [new Agent/TCPSink]
$ns attach-agent $n3 $sink

$tcp set fid_ 1
$tcp set class_ 1

$ns connect $tcp $sink

# Create an FTP transfer (using the TCP agent)
# between n0 and n3
set ftp [new Application/FTP]
$ftp attach-agent $tcp

# Start the data transfer:
$ns at 0.1 "$ftp start"
$ns at 5.0 "$ftp stop"

$ns at 0.0 "record"

# Launch the animation
$ns at 5.1 "finish"
$ns run
