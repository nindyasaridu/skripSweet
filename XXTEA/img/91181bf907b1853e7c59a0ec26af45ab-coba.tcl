#Create a simulator object
set ns [new Simulator]

#Define different colors for data flows (for NAM)
$ns color 1 Blue
$ns color 2 Red

#Open the NAM trace file
set nf [open out.nam w]
$ns namtrace-all $nf

#Define a 'finish' procedure
proc finish {} {
        global ns nf
        $ns flush-trace
        #Close the NAM trace file
        close $nf
        #Execute NAM on the trace file
        exec nam out.nam &
        exit 0
}

#Create five nodes
set n0 [$ns node]
set n1 [$ns node]
set n2 [$ns node]
set n3 [$ns node]
set n4 [$ns node]
set r0 [$ns node]
set r1 [$ns node]
set r2 [$ns node]
set r3 [$ns node]
set r4 [$ns node]
set s0 [$ns node]

#Create links between the nodes
$ns duplex-link $n0 $n1 0.5Mb 100ms DropTail
$ns duplex-link $n1 $n2 0.5Mb 100ms DropTail
$ns duplex-link $n2 $n3 0.5Mb 100ms DropTail
$ns duplex-link $n3 $n4 0.5Mb 100ms DropTail
$ns duplex-link $n4 $s0 0.5Mb 100ms DropTail
$ns duplex-link $r0 $n0 5Mb 20ms DropTail
$ns duplex-link $r1 $n1 5Mb 20ms DropTail
$ns duplex-link $r2 $n2 5Mb 20ms DropTail
$ns duplex-link $r3 $n3 5Mb 20ms DropTail
$ns duplex-link $r4 $n4 5Mb 20ms DropTail

#Set Queue Size of link (n2-n3) to 10
#$ns queue-limit $n2 $n3 10

#Give node position (for NAM)
$ns duplex-link-op $n0 $r0 orient up
$ns duplex-link-op $n0 $n1 orient right
$ns duplex-link-op $n1 $r1 orient up
$ns duplex-link-op $n1 $n2 orient right
$ns duplex-link-op $n2 $r2 orient up
$ns duplex-link-op $n2 $n3 orient right
$ns duplex-link-op $n3 $r3 orient up
$ns duplex-link-op $n3 $n4 orient right
$ns duplex-link-op $n4 $r4 orient up
$ns duplex-link-op $n4 $s0 orient right

#Monitor the queue for link (n2-n3). (for NAM)
#$ns duplex-link-op $n2 $n3 queuePos 0.5

#Setup a TCP connection
set tcp0 [new Agent/TCP]
$ns attach-agent $r0 $tcp0
set sink [new Agent/TCPSink]
$ns attach-agent $s0 $sink
$ns connect $tcp0 $sink
$tcp0 set fid_ 0

set tcp1 [new Agent/TCP]
$ns attach-agent $r0 $tcp1
set sink [new Agent/TCPSink]
$ns attach-agent $s0 $sink
$ns connect $tcp1 $sink
$tcp1 set fid_ 1

set tcp2 [new Agent/TCP]
$ns attach-agent $r0 $tcp2
set sink [new Agent/TCPSink]
$ns attach-agent $s0 $sink
$ns connect $tcp2 $sink
$tcp2 set fid_ 2

set tcp3 [new Agent/TCP]
$ns attach-agent $r0 $tcp3
set sink [new Agent/TCPSink]
$ns attach-agent $s0 $sink
$ns connect $tcp3 $sink
$tcp3 set fid_ 3

set tcp4 [new Agent/TCP]
$ns attach-agent $r0 $tcp4
set sink [new Agent/TCPSink]
$ns attach-agent $s0 $sink
$ns connect $tcp4 $sink
$tcp4 set fid_ 4

#Setup a FTP over TCP connection
set ftp0 [new Application/FTP]
$ftp0 attach-agent $tcp0
$ftp0 set type_ FTP

set ftp1 [new Application/FTP]
$ftp1 attach-agent $tcp1
$ftp1 set type_ FTP

set ftp2 [new Application/FTP]
$ftp2 attach-agent $tcp2
$ftp2 set type_ FTP

set ftp3 [new Application/FTP]
$ftp3 attach-agent $tcp3
$ftp3 set type_ FTP

set ftp4 [new Application/FTP]
$ftp4 attach-agent $tcp4
$ftp4 set type_ FTP

#Schedule events for the CBR and FTP agents
$ns at 0.1 "$ftp0 start"
$ns at 10.0 "$ftp0 stop"
$ns at 0.1 "$ftp1 start"
$ns at 10.0 "$ftp1 stop"
$ns at 0.1 "$ftp2 start"
$ns at 10.0 "$ftp2 stop"
$ns at 0.1 "$ftp3 start"
$ns at 10.0 "$ftp3 stop"
$ns at 0.1 "$ftp4 start"
$ns at 10.0 "$ftp4 stop"

#Detach tcp and sink agents (not really necessary)
# $ns at 10.0 "$ns detach-agent $n0 $tcp ; $ns detach-agent $n4 $sink"

#Call the finish procedure after 5 seconds of simulation time
$ns at 10.0 "finish"

#Run the simulation
$ns run
